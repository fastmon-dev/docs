import fs from 'node:fs';
const s = JSON.parse(
  fs.readFileSync(new URL('../.fastmon-openapi.json', import.meta.url), 'utf8'),
);
const op = s.paths['/v1/organizations/{org_id}/analytics/query']?.post;
console.log(
  JSON.stringify(
    {
      summary: op?.summary,
      paramCount: op?.parameters?.length,
      sampleParam: op?.parameters?.[0],
      reqBodyKeys: op?.requestBody && Object.keys(op.requestBody.content ?? {}),
      responses: Object.keys(op?.responses ?? {}),
    },
    null,
    2,
  ),
);
