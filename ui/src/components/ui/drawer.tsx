import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Root>
>(function Drawer({ ...props }, ref) {
  return <DrawerPrimitive.Root ref={ref} data-slot="drawer" {...props} />
})

const DrawerTrigger = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>
>(function DrawerTrigger({ ...props }, ref) {
  return <DrawerPrimitive.Trigger ref={ref} data-slot="drawer-trigger" {...props} />
})

const DrawerPortal = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Portal>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Portal>
>(function DrawerPortal({ ...props }, ref) {
  return <DrawerPrimitive.Portal ref={ref} data-slot="drawer-portal" {...props} />
})

const DrawerClose = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>
>(function DrawerClose({ ...props }, ref) {
  return <DrawerPrimitive.Close ref={ref} data-slot="drawer-close" {...props} />
})

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(function DrawerOverlay({ className, ...props }, ref) {
  return (
    <DrawerPrimitive.Overlay
      ref={ref}
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
})

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(function DrawerContent({ className, children, ...props }, ref) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})

const DrawerHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  function DrawerHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="drawer-header"
        className={cn(
          "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
          className
        )}
        {...props}
      />
    )
  }
)

const DrawerFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  function DrawerFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="drawer-footer"
        className={cn("mt-auto flex flex-col gap-2 p-4", className)}
        {...props}
      />
    )
  }
)

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(function DrawerTitle({ className, ...props }, ref) {
  return (
    <DrawerPrimitive.Title
      ref={ref}
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
})

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(function DrawerDescription({ className, ...props }, ref) {
  return (
    <DrawerPrimitive.Description
      ref={ref}
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
})

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
