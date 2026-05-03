// This file defines page-related types for the application

// Define the correct PageProps interface that matches Next.js expectations
export interface PageProps {
  params: { [key: string]: string | string[] }
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Product page specific props
export interface ProductPageProps {
  params: {
    slug: string
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Dynamic page specific props
export interface DynamicPageProps {
  params: {
    slug: string
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}
