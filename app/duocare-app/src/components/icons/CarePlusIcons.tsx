// ============================================================
//  src/components/icons/CarePlusIcons.tsx
//  Ícones SVG flat minimalista — stroke-based, sem fill
// ============================================================
import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, G } from 'react-native-svg';
 
interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}
 
// ─── Bottom Tabs ─────────────────────────────────────────────
 
export function IconDesafios({ size = 24, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconFeed({ size = 24, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="9" y1="10" x2="15" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1="9" y1="13" x2="13" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  );
}
 
export function IconLiga({ size = 24, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconConexoes({ size = 24, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconPerfil({ size = 24, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
// ─── Categorias de desafio ────────────────────────────────────
 
export function IconCorrida({ size = 32, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Figura correndo */}
      <Circle cx="20" cy="5" r="2.5" stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M20 8l-2 5-4 2 2 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M14 15l-3 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Path d="M18 13l3 5-2 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Linha do chão */}
      <Line x1="6" y1="26" x2="26" y2="26" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      {/* Indicador de velocidade */}
      <Path d="M4 12l3-1M4 15l4-0.5M4 18l3 1" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity="0.4"/>
    </Svg>
  );
}
 
export function IconHidratacao({ size = 32, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Gota d'água */}
      <Path d="M16 4C16 4 8 13 8 18a8 8 0 0 0 16 0c0-5-8-14-8-14z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Reflexo interno */}
      <Path d="M11 19a5 5 0 0 0 4 4.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity="0.5"/>
    </Svg>
  );
}
 
export function IconMeditacao({ size = 32, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Cabeça */}
      <Circle cx="16" cy="7" r="3" stroke={color} strokeWidth={strokeWidth}/>
      {/* Corpo meditando - posição lotus simplificada */}
      <Path d="M16 10v5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      {/* Braços abertos */}
      <Path d="M16 13l-5 2M16 13l5 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      {/* Pernas cruzadas */}
      <Path d="M10 20c0 0 2-5 6-5s6 5 6 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1="8" y1="22" x2="14" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1="24" y1="22" x2="18" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      {/* Ondas de calma */}
      <Path d="M13 4c0 0 1-1.5 3-1.5s3 1.5 3 1.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity="0.4"/>
    </Svg>
  );
}
 
export function IconNutricao({ size = 32, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Prato */}
      <Path d="M6 18a10 10 0 0 0 20 0H6z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="4" y1="18" x2="28" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      {/* Garfo */}
      <Path d="M10 6v5M8 6v3a2 2 0 0 0 4 0V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="10" y1="11" x2="10" y2="14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      {/* Faca */}
      <Path d="M22 6v8M22 6c2 0 3 2 3 4s-1 4-3 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
// ─── Ligas ───────────────────────────────────────────────────
 
export function IconBronze({ size = 36, color = '#CD7F32', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <Circle cx="18" cy="14" r="9" stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M14 25l-3 7M22 25l3 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1="11" y1="31" x2="25" y2="31" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Path d="M15 11l2 4 4-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconPrata({ size = 36, color = '#9CA3AF', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <Circle cx="18" cy="13" r="9" stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M13 24l-2 8M23 24l2 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1="10" y1="31" x2="26" y2="31" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      {/* Estrela interior */}
      <Path d="M18 8l1.5 3 3.5.5-2.5 2.5.5 3.5L18 16l-3 1.5.5-3.5L13 11.5l3.5-.5z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconOuro({ size = 36, color = '#F59E0B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Coroa */}
      <Path d="M8 20V11l4 4 6-7 6 7 4-4v9H8z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Rect x="8" y="20" width="20" height="4" rx="1" stroke={color} strokeWidth={strokeWidth}/>
      {/* Joias na coroa */}
      <Circle cx="18" cy="15" r="1.5" stroke={color} strokeWidth={1.4}/>
      <Circle cx="12" cy="17" r="1" stroke={color} strokeWidth={1.4}/>
      <Circle cx="24" cy="17" r="1" stroke={color} strokeWidth={1.4}/>
    </Svg>
  );
}
 
export function IconPlatina({ size = 36, color = '#6B7280', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Escudo */}
      <Path d="M18 4l12 5v8c0 6-5 11-12 13C11 28 6 23 6 17V9l12-5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Detalhe interno */}
      <Path d="M18 10l7 3v5c0 3.5-3 6.5-7 7.5C14 24.5 11 21.5 11 18v-5l7-3z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      <Path d="M15 17l2 2 4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconDiamante({ size = 36, color = '#3B82F6', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Diamante */}
      <Path d="M18 5l9 8-9 18-9-18 9-8z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="9" y1="13" x2="27" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1="18" y1="5" x2="12" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1="18" y1="5" x2="24" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      {/* Brilho */}
      <Line x1="25" y1="7" x2="27" y2="5" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity="0.6"/>
      <Line x1="27" y1="8" x2="30" y2="8" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity="0.6"/>
    </Svg>
  );
}
 
export function IconSafira({ size = 36, color = '#0F52BA', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Gema hexagonal */}
      <Path d="M18 4l8 5v8l-8 14-8-14V9l8-5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10 9l8 4 8-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="18" y1="13" x2="18" y2="31" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.5"/>
      <Line x1="10" y1="9" x2="18" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.5"/>
      <Line x1="26" y1="9" x2="18" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.5"/>
      {/* Brilhos */}
      <Line x1="24" y1="5" x2="26" y2="3" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity="0.5"/>
      <Line x1="27" y1="7" x2="30" y2="6" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity="0.5"/>
    </Svg>
  );
}
 
// ─── Ações gerais ─────────────────────────────────────────────
 
export function IconHeart({ size = 22, color = '#0D1B2A', filled = false, strokeWidth = 1.8 }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
 
export function IconComment({ size = 22, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconPlus({ size = 22, color = '#0D1B2A', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  );
}
 
export function IconSearch({ size = 20, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth}/>
      <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  );
}
 
export function IconRefresh({ size = 20, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="23 4 23 10 17 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconLogout({ size = 22, color = '#EF4444', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  );
}
 
export function IconEdit({ size = 20, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconChevronRight({ size = 20, color = '#9CA3AF', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconCheck({ size = 20, color = '#00C896', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconBell({ size = 22, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconLock({ size = 22, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
 
export function IconHelp({ size = 22, color = '#0D1B2A', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  );
}
 