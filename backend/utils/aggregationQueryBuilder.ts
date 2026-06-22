import { Model, PipelineStage, Types } from "mongoose";
import { ApiError } from "./ApiError";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchField {
  field: string;
  type?: "regex" | "text";
}

interface LookupConfig {
  from: string;
  localField: string;
  foreignField: string;
  as: string;
  unwindPath?: string;
  preserveNull?: boolean;
  pipeline?: PipelineStage.Lookup["$lookup"]["pipeline"];
}

interface ProjectionConfig {
  include?: string[];
  exclude?: string[];
  computed?: Record<string, any>;
}

interface QueryBuilderOptions<T> {
  model: Model<T>;
  query: Record<string, any>;
  searchFields?: SearchField[];
  lookups?: LookupConfig[];
  projection?: ProjectionConfig;
  defaultSort?: Record<string, 1 | -1>;
  allowSearchPagination?: boolean;
  filter?: Record<string, any>;
  postLookupSearch?: boolean;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}



// ─── buildProjection ─────────────────────────────────────────────────────────

export const buildProjection = (projection?: ProjectionConfig): Record<string, any> | null => {
  if (!projection) return null;

  const proj: Record<string, any> = {};

  if (projection.include?.length) {
    proj._id = 1;
    projection.include.forEach((f) => (proj[f] = 1));
  }

  if (projection.exclude?.length) {
    projection.exclude.forEach((f) => (proj[f] = 0));
  }

  if (projection.computed) {
    Object.assign(proj, projection.computed);
  }

  return Object.keys(proj).length ? proj : null;
};

export async function aggregateOne<T>(
  model: Model<any>,
  matchStage: Record<string, any>,
  lookups: LookupConfig[] = [],
  projection?: ProjectionConfig,
  postPipeline: PipelineStage[] = [],
): Promise<T | null> {

  const pipeline: PipelineStage[] = [
    { $match: matchStage },
  ];

  for (const lk of lookups) {
    pipeline.push({
      $lookup: {
        from: lk.from,
        localField: lk.localField,
        foreignField: lk.foreignField,
        as: lk.as,
        ...(lk.pipeline && { pipeline: lk.pipeline }),
      },
    });
    pipeline.push({
      $addFields: {
        [lk.as]: { $first: `$${lk.as}` },
      },
    });
  }
  // custom pipeline stages lookup এর পরে
  if (postPipeline.length > 0) {
    pipeline.push(...postPipeline);
  }
  const proj = buildProjection(projection);
  if (proj) pipeline.push({ $project: proj });

  const [result] = await model.aggregate(pipeline).exec();
  return result ?? null;
}

// ─── paginatedAggregate ──────────────────────────────────────────────────────

export async function paginatedAggregate<T>(
  options: QueryBuilderOptions<T>
): Promise<PaginatedResult<T>> {

  try {
    const {
      model,
      query,
      searchFields = [],
      lookups = [],
      projection,
      defaultSort = { createdAt: -1 },
      allowSearchPagination = false,
    } = options;

    const search = String(query.search || "").trim();
    const hasSearch = search.length > 0;

    const page =
      hasSearch && !allowSearchPagination
        ? 1
        : Math.max(1, Number(query.page) || 1);

    const limit =
      hasSearch && !allowSearchPagination
        ? 0
        : Math.min(100, Math.max(1, Number(query.limit) || 10));

    const skip = limit === 0 ? 0 : (page - 1) * limit;

    const matchStage: Record<string, any> = {
      ...(options.filter ?? {}),
      ...(!options.postLookupSearch && hasSearch && searchFields.length > 0
        ? searchFields.length === 1
          ? { [searchFields[0].field]: { $regex: search, $options: "i" } }
          : { $or: searchFields.map(({ field }) => ({ [field]: { $regex: search, $options: "i" } })) }
        : {}),
    };

    const projectionStage = buildProjection(projection);

    const itemsBranch: PipelineStage.FacetPipelineStage[] = [];

    // আগে সব lookup করো
    for (const lk of lookups) {
      itemsBranch.push({
        $lookup: {
          from: lk.from,
          localField: lk.localField,
          foreignField: lk.foreignField,
          as: lk.as,
          ...(lk.pipeline && { pipeline: lk.pipeline }),
        },
      });
      itemsBranch.push({
        $unwind: {
          path: `$${lk.unwindPath ?? lk.as}`,
          preserveNullAndEmptyArrays: lk.preserveNull ?? true,
        },
      });
    }

    // lookup এর পরে একবার search
    if (options.postLookupSearch && hasSearch && searchFields.length > 0) {
      itemsBranch.push({
        $match: {
          $or: searchFields.map(({ field }) => ({
            [field]: { $regex: search, $options: "i" },
          })),
        },
      });
    }

    // search এর পরে skip আর limit
    if (skip > 0) itemsBranch.push({ $skip: skip });
    if (limit > 0) itemsBranch.push({ $limit: limit });

    if (projectionStage) {
      itemsBranch.push({ $project: projectionStage });
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      { $sort: defaultSort },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          items: itemsBranch,
        },
      },
      {
        $project: {
          items: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
        },
      },
    ];

    const [result] = await model.aggregate(pipeline).exec();

    const total: number = result?.total ?? 0;
    const items: T[] = result?.items ?? [];

    return {
      items,
      total,
      page,
      limit: limit === 0 ? items.length : limit,
    };

  } catch (error: any) {
    throw new ApiError(500, error?.message || "Failed to fetch paginated data");
  }
}