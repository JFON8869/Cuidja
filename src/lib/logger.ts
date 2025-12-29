
'use client';

/**
 * Logger estruturado para monitorar eventos importantes da aplicação no console.
 */
export const logger = {
  upload: {
    start: (details: { fileName: string; path: string }) => {
      console.log(`📤 [UPLOAD] Iniciando: ${details.fileName}`, details);
    },
    success: (details: { fileName: string; url: string }) => {
      console.log(`✅ [UPLOAD] Sucesso: ${details.fileName}`, details);
    },
    error: (details: { fileName: string; error: any }) => {
      console.error(`❌ [UPLOAD] Erro: ${details.fileName}`, details);
    },
    compressStart: (fileName: string) => {
      console.log(`🗜️ [UPLOAD] Comprimindo imagem: ${fileName}`);
    },
    compressSuccess: (details: { fileName: string; originalSize: number; compressedSize: number }) => {
        const originalKB = (details.originalSize / 1024).toFixed(2);
        const compressedKB = (details.compressedSize / 1024).toFixed(2);
        console.log(`✅ [UPLOAD] Imagem comprimida: ${details.fileName}`, { original: `${originalKB} KB`, compressed: `${compressedKB} KB`});
    },
    progress: (details: { fileName:string, progress: number}) => {
        console.log(`📊 [UPLOAD] Progresso: ${details.fileName} - ${details.progress.toFixed(1)}%`);
    }
  },
};
