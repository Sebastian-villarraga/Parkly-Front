import { ResourcePage } from "@/components/parkly/resource-page"
export default async function AdminResourcePage({ params }: { readonly params: Promise<{ slug: string[] }> }) { const { slug } = await params; return <ResourcePage resource={slug.at(-1) ?? ""} /> }
