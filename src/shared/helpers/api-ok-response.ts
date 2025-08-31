// helper to declare "SuccessResponse<Model>" in responses
import { Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponse } from '../DTOs';

export const ApiOkResponseSuccess = <TModel extends Type<any>>(model: TModel) =>
  ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(model) },
          },
        },
      ],
    },
  });
