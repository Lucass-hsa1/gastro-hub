'use client'

interface Props {
  size?: number
  /** se true, renderiza apenas o ícone redondo (recortado) */
  iconOnly?: boolean
  className?: string
}

/**
 * Logo oficial do GastroHub. Usa /logo.png (servido a partir de /public).
 * - iconOnly=true: usa o pin/garfo recortado num círculo (ideal pra avatar/sidebar colapsada)
 * - iconOnly=false: logo completo com palavra "gastrohub"
 */
export default function BrandLogo({ size = 40, iconOnly = false, className = '' }: Props) {
  if (iconOnly) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '999px',
          background: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '2px solid #FF7A00',
          flexShrink: 0,
        }}
      >
        {/* Recorta o topo do logo (área do pin) */}
        <img
          src="/logo.png"
          alt="GastroHub"
          style={{
            width: size * 1.4,
            height: size * 1.4,
            objectFit: 'cover',
            objectPosition: 'center 25%',
          }}
        />
      </div>
    )
  }
  return (
    <img
      src="/logo.png"
      alt="GastroHub"
      className={className}
      style={{ height: size, width: 'auto', display: 'inline-block' }}
    />
  )
}
