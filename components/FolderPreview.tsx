import Image from 'next/image';

interface FolderPreviewProps {
    images: string[];
}

export default function FolderPreview({ images }: FolderPreviewProps) {
    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return <Image src={images[0]} alt="Folder preview" fill className="object-cover object-center" />;
    }
    if (images.length === 2) {
        return (
            <div className="absolute inset-0 flex flex-row">
                <div className="w-1/2 h-full relative border-r border-[var(--border-color)]">
                    <Image src={images[0]} alt="p1" fill sizes="80px" className="object-cover object-center" />
                </div>
                <div className="w-1/2 h-full relative">
                    <Image src={images[1]} alt="p2" fill sizes="80px" className="object-cover object-center" />
                </div>
            </div>
        );
    }
    if (images.length === 3) {
        return (
            <div className="absolute inset-0 flex flex-row">
                <div className="w-1/2 h-full relative border-r border-[var(--border-color)]">
                    <Image src={images[0]} alt="p1" fill sizes="80px" className="object-cover object-center" />
                </div>
                <div className="w-1/2 h-full flex flex-col">
                    <div className="w-full h-1/2 relative border-b border-[var(--border-color)]">
                        <Image src={images[1]} alt="p2" fill sizes="40px" className="object-cover object-center" />
                    </div>
                    <div className="w-full h-1/2 relative">
                        <Image src={images[2]} alt="p3" fill sizes="40px" className="object-cover object-center" />
                    </div>
                </div>
            </div>
        );
    }
    // 4 or more
    return (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="relative border-r border-b border-[var(--border-color)]">
                <Image src={images[0]} alt="p1" fill sizes="40px" className="object-cover object-center" />
            </div>
            <div className="relative border-b border-[var(--border-color)]">
                <Image src={images[1]} alt="p2" fill sizes="40px" className="object-cover object-center" />
            </div>
            <div className="relative border-r border-[var(--border-color)]">
                <Image src={images[2]} alt="p3" fill sizes="40px" className="object-cover object-center" />
            </div>
            <div className="relative">
                <Image src={images[3]} alt="p4" fill sizes="40px" className="object-cover object-center" />
            </div>
        </div>
    );
}
