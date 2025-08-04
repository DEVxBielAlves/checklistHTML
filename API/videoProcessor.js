import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { promisify } from 'util';

// Configurar caminho do ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// Configurações para processamento de vídeo
const VIDEO_CONFIG = {
  maxSize: 100 * 1024 * 1024, // 100MB máximo
  chunkSize: 1024 * 1024, // 1MB por chunk
  allowedFormats: ['mp4', 'webm', 'avi', 'mov', 'mkv'],
  outputFormat: 'mp4',
  quality: {
    videoBitrate: '1000k',
    audioBitrate: null, // Sem áudio
    resolution: '1280x720',
    fps: 30
  }
};

/**
 * Classe para processamento de vídeos com streams
 */
class VideoProcessor {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.outputDir = path.join(process.cwd(), 'uploads', 'videos');
    this.ensureDirectories();
  }

  /**
   * Garantir que os diretórios existam
   */
  ensureDirectories() {
    [this.tempDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Validar arquivo de vídeo
   */
  validateVideo(file) {
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    // Validar tamanho do arquivo
    if (file.size > VIDEO_CONFIG.maxSize) {
      const maxSizeMB = (VIDEO_CONFIG.maxSize / 1024 / 1024).toFixed(0);
      throw new Error(`Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Validar tamanho mínimo (evitar arquivos corrompidos)
    const minSize = 1024; // 1KB mínimo
    if (file.size < minSize) {
      throw new Error('Arquivo muito pequeno ou corrompido');
    }

    // Validar tipo MIME
    const allowedMimeTypes = [
      'video/mp4', 
      'video/webm', 
      'video/avi', 
      'video/mov', 
      'video/quicktime',
      'video/x-msvideo', // AVI alternativo
      'video/3gpp',      // 3GP
      'video/x-ms-wmv'   // WMV
    ];
    
    if (file.mimetype && !allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de arquivo não suportado: ${file.mimetype}. Tipos permitidos: MP4, WebM, AVI, MOV, QuickTime`);
    }

    // Validar extensão do arquivo
    if (file.originalname) {
      const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
      const allowedExtensions = ['mp4', 'webm', 'avi', 'mov', 'qt', '3gp', 'wmv', 'mkv'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error(`Extensão de arquivo não suportada: .${fileExtension}. Extensões permitidas: ${allowedExtensions.join(', ')}`);
      }
    }

    // Validar nome do arquivo
    if (file.originalname && file.originalname.length > 255) {
      throw new Error('Nome do arquivo muito longo (máximo 255 caracteres)');
    }

    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Processar vídeo por chunks usando streams
   */
  async processVideoStream(inputBuffer, filename, progressCallback) {
    const tempInputPath = path.join(this.tempDir, `input_${Date.now()}_${filename}`);
    const tempOutputPath = path.join(this.tempDir, `output_${Date.now()}.mp4`);
    const finalOutputPath = path.join(this.outputDir, `processed_${Date.now()}.mp4`);

    try {
      // Salvar buffer temporariamente
      await fs.promises.writeFile(tempInputPath, inputBuffer);

      // Processar vídeo com ffmpeg
      await this.processWithFFmpeg(tempInputPath, tempOutputPath, progressCallback);

      // Ler arquivo processado como stream
      const processedBuffer = await fs.promises.readFile(tempOutputPath);

      // Mover para diretório final
      await fs.promises.copyFile(tempOutputPath, finalOutputPath);

      // Limpar arquivos temporários
      await this.cleanup([tempInputPath, tempOutputPath]);

      return {
        success: true,
        outputPath: finalOutputPath,
        filename: path.basename(finalOutputPath),
        size: processedBuffer.length,
        processedBuffer
      };
    } catch (error) {
      // Limpar em caso de erro
      await this.cleanup([tempInputPath, tempOutputPath]);
      throw error;
    }
  }

  /**
   * Processar vídeo com FFmpeg (remover áudio e comprimir)
   */
  async processWithFFmpeg(inputPath, outputPath, progressCallback) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .noAudio() // Remover áudio
        .videoCodec('libx264')
        .videoBitrate(VIDEO_CONFIG.quality.videoBitrate)
        .size(VIDEO_CONFIG.quality.resolution)
        .fps(VIDEO_CONFIG.quality.fps)
        .format(VIDEO_CONFIG.outputFormat)
        .outputOptions([
          '-preset fast',
          '-crf 23',
          '-movflags +faststart'
        ])
        .output(outputPath);

      // Callback de progresso
      command.on('progress', (progress) => {
        if (progressCallback) {
          progressCallback({
            percent: progress.percent || 0,
            currentTime: progress.timemark,
            targetSize: progress.targetSize
          });
        }
      });

      // Callback de erro
      command.on('error', (err) => {
        console.error('Erro no processamento FFmpeg:', err);
        reject(new Error(`Erro no processamento: ${err.message}`));
      });

      // Callback de sucesso
      command.on('end', () => {
        console.log('Processamento FFmpeg concluído');
        resolve();
      });

      // Iniciar processamento
      command.run();
    });
  }

  /**
   * Processar vídeo em chunks para arquivos muito grandes
   */
  async processLargeVideoInChunks(inputPath, outputPath, progressCallback) {
    const stats = await fs.promises.stat(inputPath);
    const totalSize = stats.size;
    let processedSize = 0;

    const readStream = createReadStream(inputPath, {
      highWaterMark: VIDEO_CONFIG.chunkSize
    });

    const chunks = [];

    // Ler arquivo em chunks
    for await (const chunk of readStream) {
      chunks.push(chunk);
      processedSize += chunk.length;

      if (progressCallback) {
        progressCallback({
          phase: 'reading',
          percent: (processedSize / totalSize) * 50, // 50% para leitura
          processedSize,
          totalSize
        });
      }
    }

    // Combinar chunks
    const fullBuffer = Buffer.concat(chunks);

    // Processar vídeo completo
    return await this.processVideoStream(fullBuffer, path.basename(inputPath), (progress) => {
      if (progressCallback) {
        progressCallback({
          phase: 'processing',
          percent: 50 + (progress.percent || 0) * 0.5, // 50% + 50% para processamento
          ...progress
        });
      }
    });
  }

  /**
   * Converter vídeo para base64 otimizado
   */
  async videoToBase64(processedBuffer, originalFilename) {
    const base64Data = processedBuffer.toString('base64');
    const mimeType = 'video/mp4'; // Sempre MP4 após processamento

    return {
      name: originalFilename,
      type: mimeType,
      size: processedBuffer.length,
      data: `data:${mimeType};base64,${base64Data}`,
      processed: true,
      hasAudio: false
    };
  }

  /**
   * Limpar arquivos temporários
   */
  async cleanup(filePaths) {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (error) {
        console.warn(`Erro ao limpar arquivo ${filePath}:`, error.message);
      }
    }
  }

  /**
   * Obter informações do vídeo
   */
  async getVideoInfo(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

          resolve({
            duration: metadata.format.duration,
            size: metadata.format.size,
            bitrate: metadata.format.bit_rate,
            video: videoStream ? {
              codec: videoStream.codec_name,
              width: videoStream.width,
              height: videoStream.height,
              fps: eval(videoStream.r_frame_rate)
            } : null,
            audio: audioStream ? {
              codec: audioStream.codec_name,
              bitrate: audioStream.bit_rate
            } : null
          });
        }
      });
    });
  }
}

export default VideoProcessor;
export { VIDEO_CONFIG };