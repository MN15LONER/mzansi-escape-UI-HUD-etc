# Level 8 drop-in 3D models

Put GLB files here. Vite serves this folder at `/Level8Assets/`. The level keeps procedural scenery if an optional file is missing.
To avoid failed requests for files that are not packaged, add available optional model filenames to `AVAILABLE_OPTIONAL_ASSETS` in `src/game/level8Decor.js`.

## Houses (optional)

| File | Suggested use |
| --- | --- |
| `House1.glb` … `House6.glb` | Extra township houses on the sidewalks |
| `Clinic.glb` | Soweto clinic |
| `School.glb` | Primary school |
| `Spaza.glb` | Spaza landmark |
| `Home.glb` | Family house |

## Street vendors (optional)

| File | Suggested use |
| --- | --- |
| `Vendor1.glb` | Stall / table |
| `Vendor2.glb` | Stall / table |
| `StreetVendor.glb` | Vendor person or stall |
| `VendorCart.glb` | Fruit / vetkoek cart |

The game already plants corridor shops along the ridge sidewalks.

Brand lots: `shell3D.glb`, `engen3D.glb`, `KFC3D.glb` in this folder.
Named streets: Vilakazi Ridge (main), Clinic Road (east), School Road (west), Spaza Lane (east), Chris Hani Drive (west, KFC).
