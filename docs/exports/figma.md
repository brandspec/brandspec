# Export: Figma Variables

Export rules for generating Figma-compatible variables from `brand.yaml`.

## Token Mapping

| brandspec path | Figma variable |
|----------------|----------------|
| `tokens.colors.{name}.$value` | Color variable in "Brand" collection |
| `tokens.typography.{name}.$value` | String variable in "Brand" collection |

## Color Conversion

Figma does not natively support oklch. Convert `$value` to sRGB hex for import. If `$extensions.compat.hex` is present, use that value directly.

## Dark Mode

If `$extensions.dark` is present, create a "Dark" mode within the same Figma variable collection. The light value maps to the default mode.

## Output File

`output/figma-tokens.json` (Figma Variables REST API compatible format)
