// components/ui/DropdownMenu/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Fachada pública para el sistema DropdownMenu. Proporciona
 *              nombres de exportación consistentes y semánticos.
 * @version 5.1.0 (Module Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
import { Content } from "./Content";
import { Group } from "./Group";
import { Item } from "./Item";
import { Label } from "./Label";
import { Menu } from "./Menu"; // Esta importación ahora es válida
import { Separator } from "./Separator";
import { Trigger } from "./Trigger";

export const DropdownMenu = Menu;
export const DropdownMenuTrigger = Trigger;
export const DropdownMenuContent = Content;
export const DropdownMenuItem = Item;
export const DropdownMenuLabel = Label;
export const DropdownMenuSeparator = Separator;
export const DropdownMenuGroup = Group;
