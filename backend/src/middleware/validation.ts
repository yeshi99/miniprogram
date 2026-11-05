import { ZodTypeAny } from 'zod'
import { Request, Response, NextFunction } from 'express'

/**
 * 通用 Zod 校验中间件
 *
 * 支持两种 schema 写法：
 * 1. 包裹式：z.object({ body, query, params }) —— 分别校验请求体 / 查询参数 / 路径参数，并回写解析结果
 * 2. 扁平式：z.object({ field: ... }) —— 直接校验请求体
 */
export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const shape = (schema as unknown as { shape?: Record<string, unknown> }).shape
      const keys = shape ? Object.keys(shape) : []
      const isWrapped = keys.length > 0 && keys.every((k) => ['body', 'query', 'params'].includes(k))

      if (isWrapped) {
        const parsed = (await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        })) as { body?: unknown; query?: unknown; params?: unknown }

        if (parsed.body !== undefined) req.body = parsed.body
        if (parsed.query !== undefined) req.query = parsed.query as Request['query']
        if (parsed.params !== undefined) req.params = parsed.params as Request['params']
      } else {
        req.body = await schema.parseAsync(req.body)
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
