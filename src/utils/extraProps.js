export function buildExtraPropsFromPatch(patch = {}) {
  const { nextAction, url, favorite } = patch; // changed
  const extra = {};
  if (nextAction !== undefined) extra.nextAction = nextAction; // changed
  if (url !== undefined) extra.url = url;
  if (favorite !== undefined) extra.favorite = favorite;
  return Object.keys(extra).length ? extra : undefined;
}

export function extractExtrasFromRow(row = {}) {
  const e = row.extra_props || {};
  return {
    nextAction: e.nextAction ?? null, // changed
    url: e.url ?? null,
    favorite: !!e.favorite
  };
}