import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'bg-navy-secondary border-white/10 text-white',
          title: 'text-white',
          description: 'text-text-secondary',
          success: 'border-green-500/30 bg-green-500/10',
          error: 'border-red-500/30 bg-red-500/10',
          warning: 'border-yellow-500/30 bg-yellow-500/10',
          info: 'border-cyan/30 bg-cyan/10',
        },
      }}
      style={
        {
          "--normal-bg": "#0D1220",
          "--normal-text": "#F4F7FF",
          "--normal-border": "rgba(255,255,255,0.1)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
