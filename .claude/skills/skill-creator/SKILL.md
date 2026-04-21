---
name: skill-creator
description: Create new skill using the correct format and structure when the user requests a new skill that doesn't exist yet.
---

# skill-creator — New Skill Creation

## Purpose
Create a new skill when the user requests a skill that doesn't exist yet. This involves generating a new `SKILL.md` file with the correct structure and content based on the user's description of the skill's purpose, trigger conditions, and behavior rules.

## Folder Structure
When creating a new skill, ensure the following folder structure is maintained:

```.claude/skills/
├── existing-skill-1/
│   └── SKILL.md
├── existing-skill-2/
│   └── SKILL.md
└── new-skill-name/
    └── SKILL.md
```

## Document format
The `SKILL.md` file for the new skill should follow this format:

```markdown# 
---
name: skill-name
description: A brief description of the skill's purpose.
---

everything else is markdown content describing the skill's behavior rules, and any other relevant information.
```

Is important to notice the --- at the beginning and end of the metadata section, and that the name field should be in kebab-case (lowercase letters with hyphens).

Everything after the second --- is the markdown content that describes the skill's behavior rules, trigger conditions, and any other relevant information.

