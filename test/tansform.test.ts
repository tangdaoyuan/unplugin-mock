import { describe, expect, it } from 'vitest'
import { buildCjsFile, transformConfig } from '@/transform/config'

describe('runs mock config', () => {
  it('works', () => {
    const result = transformConfig({
      mockPath: './fixture/mock',
    })
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })
  it('generate cjs for single mock file', () => {
    const code = buildCjsFile('./fixture/mock/mock.ts')
    expect(code).toMatchInlineSnapshot(`
      "var __defProp = Object.defineProperty;
      var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
      var __getOwnPropNames = Object.getOwnPropertyNames;
      var __hasOwnProp = Object.prototype.hasOwnProperty;
      var __export = (target, all) => {
        for (var name in all)
          __defProp(target, name, { get: all[name], enumerable: true });
      };
      var __copyProps = (to, from, except, desc) => {
        if (from && typeof from === \\"object\\" || typeof from === \\"function\\") {
          for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except)
              __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
        }
        return to;
      };
      var __toCommonJS = (mod) => __copyProps(__defProp({}, \\"__esModule\\", { value: true }), mod);
      
      // fixture/mock/mock.ts
      var mock_exports = {};
      __export(mock_exports, {
        default: () => mock_default
      });
      module.exports = __toCommonJS(mock_exports);
      var mock_default = [
        {
          url: \\"/api/get\\",
          method: \\"get\\",
          response: () => {
            return {
              code: 0,
              data: {
                name: \\"Tedy\\"
              }
            };
          }
        },
        {
          url: \\"/api/post\\",
          method: \\"post\\",
          response: {
            code: 0,
            data: {
              name: \\"Tedy\\"
            }
          }
        }
      ];
      // Annotate the CommonJS export names for ESM import in node:
      0 && (module.exports = {});
      "
    `)
  })
})
