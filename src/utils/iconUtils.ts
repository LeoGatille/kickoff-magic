import { 
  Star, 
  Sparkles, 
  Zap, 
  Moon, 
  Sun, 
  Heart, 
  Flame,
  Snowflake,
  Music,
  Code
} from 'lucide';

// Define the available icons
export const AVAILABLE_ICONS = {
  Star,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Heart,
  Flame,
  Snowflake,
  Music,
  Code
};

export type IconName = keyof typeof AVAILABLE_ICONS;

// Cache for Path2D objects
const pathCache: Partial<Record<IconName, Path2D>> = {};

/**
 * Convert a Lucide icon definition to a Path2D object.
 * Lucide icons are defined as an array of [elementName, attributes] tuples.
 * We primarily support 'path' elements for drawing on canvas.
 */
export const getIconPath = (name: IconName): Path2D | null => {
  if (pathCache[name]) {
    return pathCache[name]!;
  }

  const iconDef = AVAILABLE_ICONS[name];
  if (!iconDef) return null;

  const combinedPath = new Path2D();

  // Lucide definitions are typically Arrays of children
  // but the export from 'lucide' package might be the IconNode which is [tag, attrs, children] or just children array?
  // The command output showed: [["path",{"d":"..."}]]
  // So it's an array of tuples.
  
  // @ts-ignore - Lucide types might be slightly opaque, treating as any[] for parsing
  const children = iconDef as any[];

  children.forEach(([tag, attrs]) => {
    if (tag === 'path' && attrs.d) {
      combinedPath.addPath(new Path2D(attrs.d));
    } else if (tag === 'circle') {
       // Convert circle to path or draw manually? 
       // Path2D has arc, so we can convert.
       const cx = parseFloat(attrs.cx);
       const cy = parseFloat(attrs.cy);
       const r = parseFloat(attrs.r);
       const circlePath = new Path2D();
       circlePath.arc(cx, cy, r, 0, 2 * Math.PI);
       combinedPath.addPath(circlePath);
    } else if (tag === 'rect') {
        const x = parseFloat(attrs.x || '0');
        const y = parseFloat(attrs.y || '0');
        const w = parseFloat(attrs.width);
        const h = parseFloat(attrs.height);
        const rectPath = new Path2D();
        rectPath.rect(x, y, w, h);
        combinedPath.addPath(rectPath);
    }
    // Add support for other shapes if needed (line, polyline, etc.)
  });

  // Scale the path? 
  // Lucide icons are 24x24 by default. 
  // We can leave them as is and let the consumer scale via ctx.scale().

  pathCache[name] = combinedPath;
  return combinedPath;
};

export const getRandomIconName = (): IconName => {
  const keys = Object.keys(AVAILABLE_ICONS) as IconName[];
  return keys[Math.floor(Math.random() * keys.length)]!;
};
