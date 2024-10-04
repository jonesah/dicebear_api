import type { FastifyPluginAsync, FastifyPluginCallback } from 'fastify';
import type { JSONSchema7Definition } from 'json-schema';
import type { Core } from '../types.js';
import { schemaHandler } from '../handler/schema.js';
import { parseQueryString } from '../utils/query-string.js';
import { AvatarRequest, avatarHandler } from '../handler/avatar.js';
import { config } from '../config.js';

type Options = {
  core: Core;
  style: any;
};

const paramsSchema: Record<string, JSONSchema7Definition> = {
  format: {
    type: 'string',
    enum: [
      'svg',
      ...(config.png.enabled ? ['png'] : []),
      ...(config.jpeg.enabled ? ['jpg', 'jpeg'] : []),
      ...(config.webp.enabled ? ['webp'] : []),
      ...(config.avif.enabled ? ['avif'] : []),
      ...(config.json.enabled ? ['json'] : []),
    ],
  },
};

export const styleRoutes: FastifyPluginCallback<Options> = (
  app,
  { core, style },
  done
) => {
  const optionsSchema: Record<string, JSONSchema7Definition> = {
    ...core.schema.properties,
    ...style.schema?.properties,
  };

  app.route({
    method: 'GET',
    url: '/schema.json',
    handler: schemaHandler(optionsSchema),
  });

  app.route<AvatarRequest>({
    method: 'GET',
    url: '/:format',
    schema: {
      querystring: optionsSchema,
      params: paramsSchema,
    },
    handler: avatarHandler(app, core, style),
  });

  app.route<AvatarRequest>({
    method: 'GET',
    url: '/:format/:options',
    preValidation: async (request) => {
      if (typeof request.params.options === 'string') {
        request.query = parseQueryString(request.params.options);
      }
    },
    schema: {
      querystring: optionsSchema,
      params: paramsSchema,
    },
    handler: avatarHandler(app, core, style),
  });

  app.route<AvatarRequest>({
    method: 'GET',
    url: '/:format/seed/:seed/:options',
    preValidation: async (request) => {
      if (typeof request.params.options === 'string') {
        request.query = parseQueryString(request.params.options);
      }
      request.query['seed'] = request.params.seed
    },
    schema: {
      querystring: optionsSchema,
      params: paramsSchema,
    },
    handler: avatarHandler(app, core, style),
  });


  done();
};
