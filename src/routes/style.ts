import type { FastifyPluginAsync, FastifyPluginCallback } from 'fastify';
import type { JSONSchema7Definition } from 'json-schema';
import type { Core } from '../types.js';
import { schemaHandler } from '../handler/schema.js';
import { parseQueryString, parseQueryStringFrom } from '../utils/query-string.js';
import { AvatarRequest, avatarHandler } from '../handler/avatar.js';
import { config } from '../config.js';
import {Md5} from 'ts-md5';

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
      if(request.query["seed"]?.includes('@'))
      {
        request.query["seed"] = Md5.hashStr(request.query["seed"]);
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
      if(request.params.seed?.includes('@'))
      {
        request.params.seed = Md5.hashStr(request.params.seed);
      }
      request.query['seed'] = request.params.seed
    },
    schema: {
      querystring: optionsSchema,
      params: paramsSchema,
    },
    handler: avatarHandler(app, core, style),
  });

  app.route<AvatarRequest>({
    method: 'GET',
    url: '/:format/seed/:seed',
    preValidation: async (request) => {
      if(request.params.seed?.includes('@'))
      {
        request.params.seed = Md5.hashStr(request.params.seed);
      }
      request.query['seed'] = request.params.seed;
    },
    schema: {
      querystring: optionsSchema,
      params: paramsSchema,
    },
    handler: avatarHandler(app, core, style),
  });

  app.route<AvatarRequest>({
    method: 'GET',
    url: '/:format/parameters/:parameters/seed/:seed',
    preValidation: async (request) => {
      if (typeof request.params.parameters === 'string') {
        request.query = parseQueryStringFrom(request.params.parameters, request.query);
      }
      if(request.params.seed?.includes('@'))
      {
        request.params.seed = Md5.hashStr(request.params.seed);
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
