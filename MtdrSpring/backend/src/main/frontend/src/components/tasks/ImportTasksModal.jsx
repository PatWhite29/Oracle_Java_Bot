import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import { parseAndValidateImportFile } from '../../services/importExportService';
import { taskService } from '../../services/taskService';
import { useToast } from '../../context/ToastContext';

export default function ImportTasksModal({ open, onClose, projectId, onImported }) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState('pick'); // pick | preview | importing | done
  const [validationErrors, setValidationErrors] = useState([]);
  const [previewTasks, setPreviewTasks] = useState([]);
  const [results, setResults] = useState(null); // { succeeded, failed: [{taskName, reason}] }

  const reset = () => {
    setStep('pick');
    setValidationErrors([]);
    setPreviewTasks([]);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationErrors([]);
    setPreviewTasks([]);

    const { tasks, errors } = await parseAndValidateImportFile(file);

    if (errors.length > 0) {
      setValidationErrors(errors);
      setStep('pick');
      return;
    }

    setPreviewTasks(tasks);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    const succeeded = [];
    const failed = [];

    for (const task of previewTasks) {
      try {
        await taskService.create(projectId, { ...task, sprintId: null });
        succeeded.push(task.taskName);
      } catch (err) {
        failed.push({ taskName: task.taskName, reason: err.message || 'Error desconocido' });
      }
    }

    setResults({ succeeded: succeeded.length, failed });
    setStep('done');

    if (succeeded.length > 0) {
      onImported();
    }
  };

  const total = previewTasks.length;

  return (
    <Modal open={open} onClose={handleClose} title="Importar tareas" size="lg">
      {step === 'pick' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecciona un archivo <span className="font-mono bg-gray-100 px-1 rounded">.json</span> con las tareas a importar.
            Se agregarán al <span className="font-medium">backlog</span> del proyecto.
          </p>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0120 9.414V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500 mb-3">Formato esperado: array JSON con campos task_name y story_points</p>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Seleccionar archivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-700 mb-2">
                El archivo contiene {validationErrors.length} error{validationErrors.length !== 1 ? 'es' : ''}:
              </p>
              <ul className="space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i} className="text-sm text-red-600 flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Formato del archivo:</p>
            <pre className="text-xs text-gray-600 overflow-x-auto">{`[
  {
    "task_name": "Nombre de la tarea",   // requerido
    "story_points": 3,                   // requerido, entero > 0
    "description": "Descripción...",     // opcional
    "status": "TODO",                    // opcional (default: TODO)
    "priority": "HIGH"                   // opcional
  }
]`}</pre>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Se importarán <span className="font-medium">{total} tarea{total !== 1 ? 's' : ''}</span> al backlog del proyecto.
            Revisa la lista antes de continuar.
          </p>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Prioridad</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">SP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewTasks.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900 max-w-[260px] truncate">{t.taskName}</td>
                    <td className="px-4 py-2"><Badge value={t.status} /></td>
                    <td className="px-4 py-2">{t.priority ? <Badge value={t.priority} /> : <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-2 text-right text-gray-700 font-mono">{t.storyPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" onClick={reset}>Cambiar archivo</Button>
            <Button onClick={handleImport}>
              Importar {total} tarea{total !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="py-10 flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-sm text-gray-500">Importando tareas...</p>
        </div>
      )}

      {step === 'done' && results && (
        <div className="space-y-4">
          <div className={`rounded-lg p-4 ${results.succeeded > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <p className="text-sm font-medium text-gray-800">
              {results.succeeded} de {total} tarea{total !== 1 ? 's' : ''} importada{results.succeeded !== 1 ? 's' : ''} exitosamente.
            </p>
          </div>

          {results.failed.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-700 mb-2">
                {results.failed.length} tarea{results.failed.length !== 1 ? 's' : ''} no se pudo{results.failed.length !== 1 ? 'eron' : ''} importar:
              </p>
              <ul className="space-y-1">
                {results.failed.map((f, i) => (
                  <li key={i} className="text-sm text-red-600">
                    <span className="font-medium">{f.taskName}</span>: {f.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={reset}>Importar otro archivo</Button>
            <Button onClick={handleClose}>Cerrar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
