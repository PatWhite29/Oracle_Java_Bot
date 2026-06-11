package com.springboot.MyTodoList.architecture;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Generates PlantUML class diagrams from the Java source tree.
 *
 * <p>The generator keeps the implementation intentionally lightweight so it can run as part of the
 * Maven build without introducing extra parsing dependencies. It groups classes into package/component
 * diagrams and writes one .puml file per group.</p>
 */
public final class PlantUmlDiagramGenerator {

	private static final Pattern PACKAGE_PATTERN = Pattern.compile("^\\s*package\\s+([\\w.]+)\\s*;");
	private static final Pattern TYPE_PATTERN = Pattern.compile(
		"^\\s*(?:@[\\w.()\\\"',\\s]+\\s+)*(?:(?:public|protected|private|abstract|final|static|sealed|non-sealed)\\s+)*(class|interface|enum|record)\\s+(\\w+)\\b(.*)$");
	private static final Set<String> JAVA_MODIFIERS = Set.of(
		"public", "protected", "private", "static", "final", "abstract", "transient", "volatile",
		"synchronized", "default", "native", "strictfp", "sealed", "non-sealed"
	);
	private static final Set<String> IGNORE_TYPE_TOKENS = Set.of(
		"String", "Object", "Integer", "Long", "Short", "Byte", "Double", "Float", "Boolean", "Character",
		"List", "Map", "Set", "Collection", "Iterable", "Optional", "Stream", "Enum", "Date", "LocalDate",
		"LocalDateTime", "Instant", "BigDecimal", "BigInteger", "UUID", "Class", "Path", "IOException"
	);

	private PlantUmlDiagramGenerator() {
	}

	public static void main(String[] args) throws IOException {
		Path sourceDir = Path.of(System.getProperty("architecture.sourceDir", "src/main/java"));
		Path outputDir = Path.of(System.getProperty("architecture.outputDir", "../../docs/diagrams"));
		String basePackage = System.getProperty("architecture.basePackage", "com.springboot.MyTodoList");

		List<TypeInfo> types = scanTypes(sourceDir, basePackage);
		Map<String, TypeInfo> typesBySimpleName = indexBySimpleName(types);
		Map<DiagramCategory, List<TypeInfo>> categorizedTypes = categorize(types);

		Files.createDirectories(outputDir);
		for (DiagramCategory category : DiagramCategory.values()) {
			Path diagramPath = outputDir.resolve(category.fileName);
			List<TypeInfo> categoryTypes = categorizedTypes.getOrDefault(category, List.of());
			if (categoryTypes.isEmpty()) {
				Files.deleteIfExists(diagramPath);
				continue;
			}

			writeDiagram(diagramPath, category, categoryTypes, typesBySimpleName);
		}
	}

	private static List<TypeInfo> scanTypes(Path sourceDir, String basePackage) throws IOException {
		if (!Files.exists(sourceDir)) {
			return List.of();
		}

		List<TypeInfo> types = new ArrayList<>();
		try (var paths = Files.walk(sourceDir)) {
			for (Path path : paths.filter(p -> Files.isRegularFile(p) && p.toString().endsWith(".java")).sorted().toList()) {
				TypeInfo typeInfo = parseType(path, basePackage);
				if (typeInfo != null) {
					types.add(typeInfo);
				}
			}
		}
		return types;
	}

	private static TypeInfo parseType(Path file, String basePackage) throws IOException {
		List<String> lines = Files.readAllLines(file, StandardCharsets.UTF_8);
		String packageName = null;
		int typeStartIndex = -1;
		String kind = null;
		String simpleName = null;
		String declarationLine = null;

		for (int i = 0; i < lines.size(); i++) {
			String line = lines.get(i);
			if (packageName == null) {
				Matcher packageMatcher = PACKAGE_PATTERN.matcher(line);
				if (packageMatcher.find()) {
					packageName = packageMatcher.group(1);
					continue;
				}
			}

			Matcher typeMatcher = TYPE_PATTERN.matcher(line);
			if (typeMatcher.find()) {
				kind = typeMatcher.group(1);
				simpleName = typeMatcher.group(2);
				declarationLine = line.trim();
				typeStartIndex = i;
				break;
			}
		}

		if (packageName == null || typeStartIndex < 0 || simpleName == null || !packageName.startsWith(basePackage) || packageName.startsWith(basePackage + ".architecture")) {
			return null;
		}

		List<MemberInfo> members = new ArrayList<>();
		Set<String> dependencyTypes = new LinkedHashSet<>();
		StringBuilder body = new StringBuilder();
		int depth = 0;
		boolean typeBodyStarted = false;
		for (int i = typeStartIndex; i < lines.size(); i++) {
			String line = lines.get(i);
			body.append(line).append(System.lineSeparator());
			depth += count(line, '{');
			depth -= count(line, '}');
			if (line.contains("{")) {
				typeBodyStarted = true;
			}

			if (!typeBodyStarted || depth < 1) {
				continue;
			}

			if (i == typeStartIndex) {
				dependencyTypes.addAll(extractTypeTokens(extractDeclarationTail(declarationLine)));
				continue;
			}

			if (depth == 1) {
				MemberInfo member = parseMember(line);
				if (member != null) {
					members.add(member);
					dependencyTypes.addAll(extractTypeTokens(member.typeExpression));
				}
			}

			if (depth == 0) {
				break;
			}
		}

		return new TypeInfo(packageName, simpleName, kind, members, dependencyTypes, file);
	}

	private static MemberInfo parseMember(String line) {
		String trimmed = line.trim();
		if (trimmed.isEmpty() || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
			return null;
		}
		if (!trimmed.endsWith(";") || trimmed.contains("(") || trimmed.startsWith("return ")) {
			return null;
		}

		String declaration = trimmed.substring(0, trimmed.length() - 1).trim();
		declaration = removeLeadingAnnotations(declaration);
		declaration = removeLeadingModifiers(declaration);
		if (declaration.isEmpty() || declaration.contains("{") || declaration.contains("}") || declaration.contains("\"") || declaration.startsWith("@")) {
			return null;
		}

		int assignmentIndex = declaration.indexOf('=');
		if (assignmentIndex >= 0) {
			declaration = declaration.substring(0, assignmentIndex).trim();
		}

		int lastSpace = declaration.lastIndexOf(' ');
		if (lastSpace < 1) {
			return null;
		}

		String typeExpression = declaration.substring(0, lastSpace).trim();
		String name = declaration.substring(lastSpace + 1).trim();
		if (typeExpression.isEmpty() || name.isEmpty()) {
			return null;
		}

		return new MemberInfo(name, typeExpression);
	}

	private static String removeLeadingAnnotations(String value) {
		String result = value.trim();
		while (result.startsWith("@")) {
			int spaceIndex = result.indexOf(' ');
			if (spaceIndex < 0) {
				return "";
			}
			result = result.substring(spaceIndex + 1).trim();
		}
		return result;
	}

	private static String removeLeadingModifiers(String value) {
		String result = value.trim();
		boolean changed;
		do {
			changed = false;
			for (String modifier : JAVA_MODIFIERS) {
				String prefix = modifier + " ";
				if (result.startsWith(prefix)) {
					result = result.substring(prefix.length()).trim();
					changed = true;
				}
			}
		} while (changed);
		return result;
	}

	private static String extractDeclarationTail(String declarationLine) {
		if (declarationLine == null) {
			return "";
		}
		int typeIndex = declarationLine.indexOf("class ");
		if (typeIndex < 0) {
			typeIndex = declarationLine.indexOf("interface ");
		}
		if (typeIndex < 0) {
			typeIndex = declarationLine.indexOf("enum ");
		}
		if (typeIndex < 0) {
			typeIndex = declarationLine.indexOf("record ");
		}
		return typeIndex < 0 ? declarationLine : declarationLine.substring(typeIndex);
	}

	private static Set<String> extractTypeTokens(String expression) {
		if (expression == null || expression.isBlank()) {
			return Set.of();
		}

		String cleaned = expression
			.replaceAll("/\\*.*?\\*/", " ")
			.replaceAll("<[^>]*>", " ")
			.replace('[', ' ')
			.replace(']', ' ')
			.replace('?', ' ')
			.replace('&', ' ')
			.replace('|', ' ')
			.replace(',', ' ')
			.replace("extends", " ")
			.replace("super", " ");

		Set<String> tokens = new LinkedHashSet<>();
		for (String token : cleaned.split("[^A-Za-z0-9_$.]+")) {
			if (token.isBlank()) {
				continue;
			}
			String simpleToken = token.contains(".") ? token.substring(token.lastIndexOf('.') + 1) : token;
			if (simpleToken.isBlank()) {
				continue;
			}
			if (Character.isUpperCase(simpleToken.charAt(0)) && !IGNORE_TYPE_TOKENS.contains(simpleToken)) {
				tokens.add(simpleToken);
			}
		}
		return tokens;
	}

	private static Map<String, TypeInfo> indexBySimpleName(List<TypeInfo> types) {
		Map<String, TypeInfo> index = new LinkedHashMap<>();
		for (TypeInfo type : types) {
			index.putIfAbsent(type.simpleName(), type);
		}
		return index;
	}

	private static Map<DiagramCategory, List<TypeInfo>> categorize(List<TypeInfo> types) {
		Map<DiagramCategory, List<TypeInfo>> categorized = new EnumMap<>(DiagramCategory.class);
		for (DiagramCategory category : DiagramCategory.values()) {
			categorized.put(category, new ArrayList<>());
		}

		for (TypeInfo type : types) {
			EnumSet<DiagramCategory> categories = classify(type);
			for (DiagramCategory category : categories) {
				categorized.get(category).add(type);
			}
		}

		for (Map.Entry<DiagramCategory, List<TypeInfo>> entry : categorized.entrySet()) {
			entry.getValue().sort((left, right) -> left.simpleName().compareToIgnoreCase(right.simpleName()));
		}
		return categorized;
	}

	private static EnumSet<DiagramCategory> classify(TypeInfo type) {
		EnumSet<DiagramCategory> categories = EnumSet.noneOf(DiagramCategory.class);
		String packageName = type.packageName().toLowerCase(Locale.ROOT);
		String simpleName = type.simpleName();
		String lowerSimpleName = simpleName.toLowerCase(Locale.ROOT);

		if (packageName.contains("controller") || lowerSimpleName.endsWith("controller") || lowerSimpleName.equals("spacontroller")) {
			categories.add(DiagramCategory.CONTROLLERS);
		}
		if (packageName.contains("repository") || lowerSimpleName.endsWith("repository")) {
			categories.add(DiagramCategory.REPOSITORIES);
		}
		if (packageName.contains("service") || lowerSimpleName.endsWith("service") || lowerSimpleName.endsWith("scheduler")) {
			categories.add(DiagramCategory.SERVICES);
		}
		if (packageName.contains("notification") || lowerSimpleName.startsWith("notification")) {
			categories.add(DiagramCategory.NOTIFICATION);
		}
		if (packageName.contains("telegram.nlu") || packageName.endsWith(".nlu") || lowerSimpleName.contains("nlu") || simpleName.equals("NaturalLanguageRouter")) {
			categories.add(DiagramCategory.NLU);
		}
		if ((packageName.contains(".telegram") && !packageName.contains(".telegram.nlu")) || lowerSimpleName.endsWith("bot")) {
			categories.add(DiagramCategory.BOT);
		}
		if (packageName.contains("config") || lowerSimpleName.endsWith("config") || lowerSimpleName.endsWith("filter") || lowerSimpleName.endsWith("util") || lowerSimpleName.endsWith("detailsserviceimpl")) {
			categories.add(DiagramCategory.CONFIG);
		}
		if (packageName.contains("audit") || lowerSimpleName.startsWith("audit")) {
			categories.add(DiagramCategory.AUDIT);
		}
		if (categories.isEmpty() && !lowerSimpleName.endsWith("application")) {
			categories.add(DiagramCategory.MODELS);
		}

		// Keep domain and shared model classes in the models diagram even if they are also cross-cutting concerns.
		if (categories.contains(DiagramCategory.AUDIT) || categories.contains(DiagramCategory.CONFIG)) {
			categories.add(DiagramCategory.MODELS);
		}

		return categories;
	}

	private static void writeDiagram(Path diagramPath, DiagramCategory category, List<TypeInfo> types, Map<String, TypeInfo> typesBySimpleName) throws IOException {
		Set<String> includedSimpleNames = types.stream().map(TypeInfo::simpleName).collect(Collectors.toCollection(TreeSet::new));
		StringBuilder diagram = new StringBuilder();
		diagram.append("@startuml\n");
		diagram.append("title ").append(category.title).append("\n");
		diagram.append("skinparam classAttributeIconSize 0\n");
		diagram.append("hide empty members\n");
		diagram.append("left to right direction\n\n");

		diagram.append("package \"").append(category.title).append("\" {\n");
		for (TypeInfo type : types) {
			diagram.append(renderClass(type)).append('\n');
		}
		diagram.append("}\n\n");

		Set<String> relationLines = new LinkedHashSet<>();
		for (TypeInfo type : types) {
			for (String dependency : type.dependencyTypes()) {
				TypeInfo resolved = typesBySimpleName.get(dependency);
				if (resolved == null || resolved.simpleName().equals(type.simpleName())) {
					continue;
				}
				String relation = type.simpleName() + " --> " + resolved.simpleName();
				if (includedSimpleNames.contains(resolved.simpleName())) {
					relation += " : uses";
				} else {
					relation += " : depends on";
				}
				relationLines.add(relation);
			}
		}

		if (!relationLines.isEmpty()) {
			diagram.append(String.join("\n", relationLines)).append('\n');
		}
		diagram.append("@enduml\n");

		Files.writeString(diagramPath, diagram.toString(), StandardCharsets.UTF_8);
	}

	private static String renderClass(TypeInfo type) {
		StringBuilder rendered = new StringBuilder();
		rendered.append(type.kind()).append(' ').append(type.simpleName()).append(" {\n");
		for (MemberInfo member : type.members()) {
			rendered.append("  + ").append(member.name()).append(" : ").append(member.typeExpression()).append("\n");
		}
		rendered.append("}\n");
		return rendered.toString();
	}

	private static int count(String value, char needle) {
		int count = 0;
		for (int i = 0; i < value.length(); i++) {
			if (value.charAt(i) == needle) {
				count++;
			}
		}
		return count;
	}

	private record TypeInfo(
		String packageName,
		String simpleName,
		String kind,
		List<MemberInfo> members,
		Set<String> dependencyTypes,
		Path sourceFile
	) {
	}

	private record MemberInfo(String name, String typeExpression) {
	}

	private enum DiagramCategory {
		CONTROLLERS("controllers.puml", "Controllers"),
		SERVICES("services.puml", "Services"),
		REPOSITORIES("repositories.puml", "Repositories"),
		BOT("bot.puml", "Bot"),
		NOTIFICATION("notification.puml", "Notification"),
		NLU("nlu.puml", "NLU"),
		CONFIG("config.puml", "Config"),
		AUDIT("audit.puml", "Audit"),
		MODELS("models.puml", "Entities and Models");

		private final String fileName;
		private final String title;

		DiagramCategory(String fileName, String title) {
			this.fileName = fileName;
			this.title = title;
		}
	}
}