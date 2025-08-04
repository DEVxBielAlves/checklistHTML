# Sistema de Processamento de Vídeos - BASELL Checklist

## Visão Geral

O sistema de processamento de vídeos foi implementado para permitir o upload, processamento e armazenamento de vídeos grandes no checklist BASELL, utilizando streams e processamento em chunks para otimizar a performance e evitar sobrecarga de memória.

## Características Principais

### 🎥 Processamento de Vídeos
- **Remoção automática de áudio** - Todos os vídeos são processados sem som
- **Compressão inteligente** - Otimização automática para reduzir tamanho
- **Processamento por chunks** - Upload em pedaços de 1MB para arquivos grandes
- **Suporte a múltiplos formatos** - MP4, WebM, AVI, MOV, QuickTime, 3GP, WMV

### 📊 Limites e Validações
- **Tamanho máximo**: 100MB por vídeo
- **Tamanho mínimo**: 1KB (evita arquivos corrompidos)
- **Formatos suportados**: MP4, WebM, AVI, MOV, QuickTime, 3GP, WMV, MKV
- **Resolução máxima**: 1280x720 (720p)
- **Taxa de quadros**: 30fps
- **Bitrate máximo**: 1000k

### 🔄 Fluxo de Processamento

1. **Upload do Frontend**
   - Validação de tipo e tamanho no cliente
   - Barra de progresso visual
   - Feedback em tempo real

2. **Processamento no Backend**
   - Validação adicional de segurança
   - Remoção de áudio usando FFmpeg
   - Compressão e otimização
   - Conversão para MP4 (formato padrão)

3. **Armazenamento**
   - Conversão para Base64
   - Salvamento no banco PostgreSQL
   - Metadados preservados

## Arquitetura Técnica

### Backend (Node.js + Express)

#### Dependências
```json
{
  "multer": "^1.4.5",
  "ffmpeg-static": "^5.2.0",
  "fluent-ffmpeg": "^2.1.3"
}
```

#### Endpoints

##### POST `/api/video/process`
Processa vídeos com remoção de áudio e compressão.

**Request:**
```javascript
// FormData
const formData = new FormData();
formData.append('video', videoFile);
```

**Response:**
```json
{
  "success": true,
  "filename": "processed_video.mp4",
  "size": 1234567,
  "base64Data": "data:video/mp4;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEA...",
  "originalSize": 2345678,
  "compressionRatio": "1.90"
}
```

##### POST `/api/video/process-large`
Processa vídeos grandes usando chunks (em desenvolvimento).

##### GET `/api/video/info`
Obtém informações de um vídeo sem processá-lo.

#### Configurações de Vídeo
```javascript
const VIDEO_CONFIG = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  CHUNK_SIZE: 1024 * 1024,     // 1MB chunks
  SUPPORTED_FORMATS: ['mp4', 'webm', 'avi', 'mov', 'quicktime'],
  OUTPUT_FORMAT: 'mp4',
  MAX_BITRATE: '1000k',
  MAX_RESOLUTION: '1280x720',
  FRAMERATE: 30
};
```

### Frontend (JavaScript)

#### Configurações de Mídia
```javascript
const MEDIA_CONFIG = {
  MAX_FILE_SIZE: 2 * 1024 * 1024,     // 2MB para imagens
  MAX_VIDEO_SIZE: 100 * 1024 * 1024,  // 100MB para vídeos
  ALLOWED_TYPES: [
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "video/mp4", "video/webm", "video/avi", "video/mov", "video/quicktime"
  ]
};
```

#### Funções Principais

##### `processVideoFile(file)`
Processa um arquivo de vídeo enviando para o backend.

##### `showVideoProcessingProgress(filename, progressId, progress)`
Exibe barra de progresso visual durante o upload.

##### `updateVideoProcessingProgress(progressId, progress)`
Atualiza o progresso da barra visual.

## Interface do Usuário

### Barra de Progresso
- **Localização**: Canto inferior direito
- **Informações**: Nome do arquivo, porcentagem, status
- **Estados**: Processando → Concluído → Auto-remove após 2s

### Feedback Visual
- **Sucesso**: Mensagem verde com ícone de check
- **Erro**: Mensagem vermelha com detalhes do erro
- **Aviso**: Mensagem amarela para arquivos não suportados
- **Info**: Mensagem azul para status de processamento

## Tratamento de Erros

### Validações Frontend
- Tipo de arquivo não suportado
- Tamanho excede limite (100MB)
- Arquivo corrompido ou muito pequeno

### Validações Backend
- Validação adicional de tipo MIME
- Verificação de extensão de arquivo
- Validação de integridade do vídeo
- Limites de processamento FFmpeg

### Mensagens de Erro Comuns

| Erro | Causa | Solução |
|------|-------|----------|
| "Formato não suportado" | Arquivo não é vídeo válido | Use MP4, WebM, AVI, MOV |
| "Arquivo muito grande" | Vídeo > 100MB | Comprima o vídeo antes do upload |
| "Erro no processamento" | Falha no FFmpeg | Verifique se o arquivo não está corrompido |
| "Conexão perdida" | Problema de rede | Tente novamente |

## Performance e Otimizações

### Compressão Automática
- **Bitrate**: Limitado a 1000k para reduzir tamanho
- **Resolução**: Redimensionado para máximo 1280x720
- **Framerate**: Padronizado em 30fps
- **Codec**: H.264 para máxima compatibilidade

### Processamento por Chunks
- **Tamanho do chunk**: 1MB
- **Benefícios**: Reduz uso de memória, permite upload de arquivos grandes
- **Fallback**: Sistema tradicional para arquivos menores

### Otimizações de Rede
- **Compressão gzip**: Habilitada no servidor
- **Timeout**: 5 minutos para uploads grandes
- **Retry**: Sistema de tentativas automáticas

## Monitoramento e Logs

### Logs do Backend
```
✅ Vídeo processado: video.mp4 - sem áudio, otimizado
📊 Compressão: 15.2MB → 8.7MB (1.75x)
⚠️ Arquivo muito grande: video.avi (150MB)
❌ Erro FFmpeg: Invalid format
```

### Logs do Frontend
```
🎥 Processando video.mp4...
✅ video.mp4 processado com sucesso
⚠️ Arquivo video.avi é muito grande (máx. 100MB)
❌ Erro ao processar video.mov: Formato não suportado
```

## Segurança

### Validações de Segurança
- **Tipo MIME**: Verificação dupla (frontend + backend)
- **Extensão**: Whitelist de extensões permitidas
- **Tamanho**: Limites rígidos para evitar DoS
- **Sanitização**: Nome de arquivo sanitizado

### Prevenção de Ataques
- **Upload limitado**: Máximo 100MB por arquivo
- **Timeout**: Processamento limitado a 5 minutos
- **Validação**: Múltiplas camadas de validação
- **Isolamento**: Processamento em ambiente controlado

## Troubleshooting

### Problemas Comuns

1. **FFmpeg não encontrado**
   ```bash
   npm install ffmpeg-static
   ```

2. **Erro de memória**
   - Reduzir tamanho do chunk
   - Aumentar limite de memória Node.js

3. **Timeout no upload**
   - Verificar conexão de rede
   - Reduzir tamanho do arquivo

4. **Vídeo não processa**
   - Verificar se arquivo não está corrompido
   - Tentar converter para MP4 antes do upload

### Comandos Úteis

```bash
# Verificar logs do servidor
tail -f logs/video-processing.log

# Testar endpoint
curl -X POST -F "video=@test.mp4" http://localhost:5001/api/video/process

# Verificar espaço em disco
df -h

# Monitorar uso de memória
top -p $(pgrep node)
```

## Roadmap

### Próximas Funcionalidades
- [ ] Processamento em background com queue
- [ ] Suporte a legendas
- [ ] Thumbnail automático
- [ ] Streaming de vídeo
- [ ] Compressão adaptativa baseada na conexão
- [ ] Suporte a vídeos 4K
- [ ] API de status de processamento em tempo real

### Melhorias Planejadas
- [ ] Cache de vídeos processados
- [ ] CDN para distribuição
- [ ] Análise de qualidade automática
- [ ] Compressão por IA
- [ ] Suporte a múltiplas resoluções

---

**Versão**: 1.0.0  
**Data**: Janeiro 2025  
**Autor**: Sistema BASELL  
**Licença**: Proprietária