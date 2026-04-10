// Utils
import { createID } from "@/utils/createId";
// React
import { RefObject } from "react";
// Next
import Link from "next/link";

type HeadingLink = {
  type: string;
  text: string;
};

type TableOfContentsMenuProps = {
  headingLinks: (HeadingLink | undefined)[];
  activeId: string | null;
  activeItemRef: RefObject<HTMLLIElement | null>;
};

type TableOfContentsListItemProps = {
  isActive: boolean;
  activeItemRef: RefObject<HTMLLIElement | null>;
  itemId: string;
  val: HeadingLink;
  marginStartVal: string;
  textSize: string;
};

export default function TableOfContentsMenu({ headingLinks, activeId, activeItemRef }: TableOfContentsMenuProps) {
  return (
    <nav>
        <menu>
            {/* Show heading text and increase indentation for subheadings */}
            {headingLinks.map((val, idx: number) => {
                if (!val) return null;
                const itemId = createID(val.text || "");
                const isActive = activeId === itemId;
                
                if (val?.type === "heading2") {
                    return <TableOfContentsListItem
                        key={idx}
                        isActive={isActive}
                        activeItemRef={activeItemRef}
                        itemId={itemId}
                        val={val}
                        marginStartVal={"ms-1"}
                        textSize={"text-base"}
                    />
                }
                if (val?.type === "heading3") {
                    return <TableOfContentsListItem
                        key={idx}
                        isActive={isActive}
                        activeItemRef={activeItemRef}
                        itemId={itemId}
                        val={val}
                        marginStartVal={"ms-2"}
                        textSize={"text-[0.975rem]"}
                    />
                }
                if (val?.type === "heading4") {
                    return <TableOfContentsListItem
                        key={idx}
                        isActive={isActive}
                        activeItemRef={activeItemRef}
                        itemId={itemId}
                        val={val}
                        marginStartVal={"ms-4"}
                        textSize={"text-[0.95rem]"}
                    />
                }
                if (val?.type === "heading5") {
                    return <TableOfContentsListItem
                        key={idx}
                        isActive={isActive}
                        activeItemRef={activeItemRef}
                        itemId={itemId}
                        val={val}
                        marginStartVal={"ms-6"}
                        textSize={"text-[0.925rem]"}
                    />
                }
                if (val?.type === "heading6") {
                    return <TableOfContentsListItem
                        key={idx}
                        isActive={isActive}
                        activeItemRef={activeItemRef}
                        itemId={itemId}
                        val={val}
                        marginStartVal={"ms-8"}
                        textSize={"text-[0.9rem]"}
                    />
                }
            })}
        </menu>
    </nav>
  )
}


function TableOfContentsListItem({isActive, activeItemRef, itemId, val, marginStartVal, textSize} : TableOfContentsListItemProps) {
  return (
    <li
      ref={isActive ? activeItemRef : null}
      className={`${isActive ? "text-cyan-400 before:content-['•'] before:text-current-400 before:absolute before:-left-1" : ""} relative ps-2 mb-2 last:mb-0 ${textSize} hover:text-[#1f2937] transition-colours duration-300 ${marginStartVal}`}>
      <Link className="no-underline" href={`#${itemId}`}>
          {val.text}
      </Link>
    </li>
  )
}