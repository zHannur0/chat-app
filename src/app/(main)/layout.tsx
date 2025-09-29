import { Header } from "@/shared/components/Layout/Header";


export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Header />
            {children}
        </div>
    )
}