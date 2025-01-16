import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const HoverEffect = ({
    items,
    className,
  }: {
    items: {
      title: string;
      description: string;
      link: string;
      image: string | null; // Include image in the type
    }[];
    className?: string;
  }) => {
    let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10 gap-4",
          className
        )}
      >
        {items.map((item, idx) => (
          <a
            href={item?.link}
            key={item?.link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group block h-full w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-green-600/[0.8] dark:bg-green-600/[0.8] block rounded-3xl"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>
            <Card image={item.image}>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          </a>
        ))}
      </div>
    );
  };
  
  export const Card = ({
    className,
    children,
    image,
  }: {
    className?: string;
    children: React.ReactNode;
    image: string | null; // Accept an image as a prop
  }) => {
    return (
      <div
        className={cn(
          "rounded-3xl h-full w-full overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/[0.2] group-hover:border-slate-700 relative z-20",
          className
        )}
      >
        {image && (
          <img
            src={image}
            alt=""
            className="w-full h-40 object-cover rounded-t-3xl"
          />
        )}
        <div className="p-4">{children}</div>
      </div>
    );
  };
  
  export const CardTitle = ({
    className,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) => {
    return (
      <h4 className={cn("text-black dark:text-white font-bold tracking-wide", className)}>
        {children}
      </h4>
    );
  };
  
  export const CardDescription = ({
    className,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) => {
    return (
      <p
        className={cn(
          "mt-4 text-gray-600 dark:text-gray-400 tracking-wide leading-relaxed text-sm",
          className
        )}
      >
        {children}
      </p>
    );
  };
  
