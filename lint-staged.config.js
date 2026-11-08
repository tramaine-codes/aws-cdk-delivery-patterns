export default {
  '*.{js,json,md,ts,yml}':
    'biome check --write --no-errors-on-unmatched --files-ignore-unknown=true',
};
