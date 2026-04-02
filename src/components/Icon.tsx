// Next
import Link from "next/link";

type IconProps = {
    iconText: string;
    iconShareLink: string;
}

// Add more icons as needed
export default function Icon({ icon } : { icon: IconProps } ) {
    const fillColour = "currentColor";
    if (icon.iconText?.toLowerCase().trim() === "x") {
        return (
            <Link href={icon.iconShareLink} className="hover:text-[#1f2937] transition-colors duration-200">
                <svg viewBox="0 -3 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" fill={fillColour}/></svg>
            </Link>
        )
    }
    if (icon.iconText?.toLowerCase().trim() === "linkedin") {
        return (
        <Link href={icon.iconShareLink} className="hover:text-[#1f2937] transition-colors duration-200">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"><path d="M18.744 56H8.793V23.953h9.951V56Zm-4.98-36.419C10.58 19.581 8 16.946 8 13.763a5.763 5.763 0 0 1 11.527 0c0 3.183-2.582 5.818-5.764 5.818ZM55.99 56h-9.93V40.4c0-3.718-.075-8.486-5.174-8.486-5.174 0-5.967 4.04-5.967 8.218V56h-9.94V23.953h9.544v4.371h.139c1.329-2.518 4.574-5.175 9.416-5.175C54.15 23.15 56 29.782 56 38.396V56h-.01Z" fill={fillColour}></path></svg>
        </Link>
        )
    }
    if (icon.iconText?.toLowerCase().trim() === "mail") {
        return (
            <Link href={icon.iconShareLink} className="hover:text-[#1f2937] transition-colors duration-200">
                <svg viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"><path d="M12.5 14a4.501 4.501 0 0 0-2.7 8.1l20.4 15.3a3.01 3.01 0 0 0 3.6 0l20.4-15.3a4.501 4.501 0 0 0-2.7-8.1h-39ZM8 24.5V44c0 3.31 2.69 6 6 6h36c3.31 0 6-2.69 6-6V24.5L35.6 39.8a5.99 5.99 0 0 1-7.2 0L8 24.5Z" fill={fillColour}></path></svg>
            </Link>
        )
    }
}
