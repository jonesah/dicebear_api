import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Core } from '../types.js';
import { config } from '../config.js';
import { toJpeg, toPng, toWebp, toAvif } from '@dicebear/converter';
import { getRequiredFonts } from '../utils/fonts.js';

export type AvatarRequest = {
  Params: {
    format: 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif' | 'json';
    seed?: string
    options?: Record<string, any>;
  };
  Querystring: Record<string, any>;
};

export function avatarHandler(app: FastifyInstance, core: Core, style: any) {
  return async (
    request: FastifyRequest<AvatarRequest>,
    reply: FastifyReply
  ) => {
    const options = request.query;

    // Validate Size for PNG Format
    if (request.params.format === 'png') {
      options['size'] = options['s'] ? options['s'] :  options['size']
      options['size'] = options['size']
        ? 
        
          Math.min(
            Math.max(options['size'], config.png.size.min),
            config.png.size.max
          )
        : config.png.size.default;
    }

    // Validate Size for JPEG Format
    if (request.params.format === 'jpg') {
      options['size'] = options['s'] ? options['s'] :  options['size']
      options['size'] = options['size']
        ? Math.min(
            Math.max(options['size'], config.jpeg.size.min),
            config.jpeg.size.max
          )
        : config.png.size.default;
    }

    // Validate Size for WebP Format
    if (request.params.format === 'webp') {
      options['size'] = options['s'] ? options['s'] :  options['size']
      options['size'] = options['size']
        ? Math.min(
            Math.max(options['size'], config.webp.size.min),
            config.jpeg.size.max
          )
        : config.png.size.default;
    }

    // Validate Size for Avif Format
    if (request.params.format === 'avif') {
      options['size'] = options['s'] ? options['s'] :  options['size']
      options['size'] = options['size']
        ? Math.min(
            Math.max(options['size'], config.avif.size.min),
            config.jpeg.size.max
          )
        : config.png.size.default;
    }

    // Define default seed
    options['seed'] = options['seed'] ?? '';

    // Define filename
    reply.header(
      'Content-Disposition',
      `inline; filename="avatar.${request.params.format}"`
    );

    // Create avatar
    const avatar = core.createAvatar(style, options);

    reply.header('X-Robots-Tag', 'noindex');
    reply.header('Cache-Control', `max-age=${config.cacheControl.avatar}`);

    switch (request.params.format) {
      case 'svg':
        reply.header('Content-Type', 'image/svg+xml');

        return avatar.toString();

      case 'png':
        reply.header('Content-Type', 'image/png');

        const png = await toPng(avatar.toString(), {
          includeExif: config.png.exif,
          fonts: getRequiredFonts(avatar.toString(), app.fonts),
        }).toArrayBuffer();

        return Buffer.from(png);

      case 'jpg':
      case 'jpeg':
        reply.header('Content-Type', 'image/jpeg');

        const jpeg = await toJpeg(avatar.toString(), {
          includeExif: config.jpeg.exif,
          fonts: getRequiredFonts(avatar.toString(), app.fonts),
        }).toArrayBuffer();

        return Buffer.from(jpeg);

      case 'webp':
        reply.header('Content-Type', 'image/webp');

        const webp = await toWebp(avatar.toString(), {
          includeExif: config.png.exif,
          fonts: getRequiredFonts(avatar.toString(), app.fonts),
        }).toArrayBuffer();

        return Buffer.from(webp);

      case 'avif':
        reply.header('Content-Type', 'image/avif');

        const avif = await toAvif(avatar.toString(), {
          includeExif: config.png.exif,
          fonts: getRequiredFonts(avatar.toString(), app.fonts),
        }).toArrayBuffer();

        return Buffer.from(avif);

      case 'json':
        reply.header('Content-Type', 'application/json');

        return JSON.stringify(avatar.toJson());
    }
  };
}
