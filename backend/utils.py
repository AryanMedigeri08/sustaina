import json
import urllib.request
from fastapi import HTTPException

def pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, bit_depth: int = 16) -> bytes:
    """Prepends a 44-byte WAV header to raw PCM bytes."""
    num_samples = len(pcm_data)
    block_align = channels * (bit_depth // 8)
    byte_rate = sample_rate * block_align
    
    header = bytearray(44)
    # RIFF header
    header[0:4] = b'RIFF'
    header[4:8] = (36 + num_samples).to_bytes(4, 'little')
    header[8:12] = b'WAVE'
    # "fmt " subchunk
    header[12:16] = b'fmt '
    header[16:20] = (16).to_bytes(4, 'little') # subchunk1size (16 for PCM)
    header[20:22] = (1).to_bytes(2, 'little')  # audio format (1 for PCM)
    header[22:24] = channels.to_bytes(2, 'little')
    header[24:28] = sample_rate.to_bytes(4, 'little')
    header[28:32] = byte_rate.to_bytes(4, 'little')
    header[32:34] = block_align.to_bytes(2, 'little')
    header[34:36] = bit_depth.to_bytes(2, 'little')
    # "data" subchunk
    header[36:40] = b'data'
    header[40:44] = num_samples.to_bytes(4, 'little')
    
    return bytes(header) + pcm_data
