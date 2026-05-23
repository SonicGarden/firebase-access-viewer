import { firebaseServices, isSuccessfulStatus } from '@/utils';
import type { FirebaseServiceName } from '@/utils';
import type { Request } from '@/utils/requestHistory';

export type PathAggregate = {
  path: string;
  count: number;
  services: FirebaseServiceName[];
  errorCount: number;
  requests: Request[];
  isNPlusOneSuspect: boolean;
};

const N_PLUS_ONE_THRESHOLD = 5;

export const aggregateByPath = (requests: Request[]): PathAggregate[] => {
  const buckets = new Map<string, Request[]>();
  for (const req of requests) {
    if (req.paths === '') continue;
    const bucket = buckets.get(req.paths);
    if (bucket) bucket.push(req);
    else buckets.set(req.paths, [req]);
  }

  const aggregates: PathAggregate[] = [];
  for (const [path, bucketRequests] of buckets) {
    const servicesPresent = new Set(bucketRequests.map((r) => r.service));
    const services = firebaseServices
      .map(({ name }) => name)
      .filter((name) => servicesPresent.has(name));
    const errorCount = bucketRequests.filter((r) => !isSuccessfulStatus(r.status)).length;
    const sortedRequests = [...bucketRequests].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    aggregates.push({
      path,
      count: bucketRequests.length,
      services,
      errorCount,
      requests: sortedRequests,
      isNPlusOneSuspect: bucketRequests.length >= N_PLUS_ONE_THRESHOLD,
    });
  }

  aggregates.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.requests[0].requestedAt.localeCompare(a.requests[0].requestedAt);
  });

  return aggregates;
};
