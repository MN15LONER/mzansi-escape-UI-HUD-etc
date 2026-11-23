// threeDispose.js — Dispose geometries/materials on Three.js object trees.

export function disposeGeometries(object) {
  object.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
  })
}

function addTextures(value, textures) {
  if (value?.isTexture) {
    textures.add(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => addTextures(item, textures))
  }
}

export function disposeTextures(objects) {
  const roots = Array.isArray(objects) ? objects : [objects]
  const textures = new Set()

  for (const root of roots) {
    root.traverse((obj) => {
      if (!obj.material) return
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const material of materials) {
        Object.values(material).forEach((value) => addTextures(value, textures))
        if (material.uniforms) {
          Object.values(material.uniforms).forEach((uniform) =>
            addTextures(uniform?.value, textures)
          )
        }
      }
    })
  }

  textures.forEach((texture) => texture.dispose())
}

export function disposeObject3D(object) {
  object.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((d) => d.dispose())
      } else {
        obj.material.dispose()
      }
    }
  })
}
