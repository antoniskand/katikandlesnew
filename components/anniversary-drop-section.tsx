"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import type { Drop, Product } from "@/types/product"
import { formatPrice } from "@/lib/utils"

// Inline SVG leaf
function LeafDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 50 520 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M479.781 320.024C466.766 320.783 453.69 320.976 440.748 322.403C401.492 326.733 362.253 331.245 323.077 336.236C280.324 341.681 240.271 334.037 201.593 315.136C161.015 295.308 121.053 274.616 89.4436 241.64C73.9589 225.487 60.7828 207.113 46.6848 189.644C36.6111 177.158 26.6171 164.605 16.8979 151.845C15.2068 149.624 15.0468 146.236 14.1826 143.389C16.9621 143.237 19.9802 142.294 22.4833 143.052C58.9997 154.094 96.8205 162.198 131.605 177.285C190.587 202.865 250.977 222.821 313.741 235.763C335.965 240.347 355.659 248.97 373.711 262.647C403.38 285.13 436.463 301.414 471.487 313.848C474.381 314.876 477.142 316.277 479.963 317.505C479.904 318.342 479.843 319.183 479.784 320.019L479.781 320.024Z"
        fill="#7D947C"
      />
      <path
        d="M495.466 317.636C471.317 304.286 446.978 291.261 423.061 277.504C384.455 255.297 343.501 238.397 301.655 223.697C249.247 205.287 196.776 186.969 143.787 170.342C107.688 159.016 70.6594 150.669 34.0535 140.958C31.0536 140.163 28.1206 139.128 23.2644 137.62C25.8228 136.299 26.7 135.651 27.6827 135.366C108.985 111.844 192.247 100.2 275.198 118.309C363.686 137.627 433.85 185.472 467.901 274.482C474.114 290.721 484.285 303.313 496.646 314.745C496.253 315.71 495.855 316.673 495.462 317.638L495.466 317.636Z"
        fill="#7D947C"
      />
    </svg>
  )
}

function OrangeSliceDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="100 20 550 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M636.406 201.143C635.952 203.413 635.687 206.246 635.073 208.472C632.724 216.973 629.859 224.033 626.945 232.33C625.401 236.73 626.216 237.661 630.403 238.34C671.867 245.067 709.072 262.257 743.925 285.057C746.421 286.691 748.255 289.333 750.398 291.504C747.55 291.483 744.691 291.609 741.858 291.402C737.983 291.12 734.128 290.566 730.258 290.182C729.704 290.127 729.121 290.388 727.689 290.678C729.709 292.165 731.269 293.135 732.615 294.345C734.293 295.85 735.793 297.551 737.369 299.169C734.998 299.592 732.594 300.512 730.266 300.35C721.647 299.754 713.07 298.364 704.449 298.066C682.768 297.313 661.072 296.883 639.381 296.454L636.476 296.396C618.985 296.049 601.464 296.375 584.012 295.39C577.965 295.048 575.208 297.672 571.097 302.506C582.891 303.274 593.509 303.852 604.108 304.683C631.482 306.826 658.809 309.491 685.137 317.864C691.211 319.795 697.211 322.654 702.479 326.219C708.421 330.238 708.398 335.909 702.45 340.022C697.211 343.647 691.284 346.691 685.229 348.661C656.919 357.871 627.541 361.634 598.053 364.331C533.062 370.276 468.08 368.48 403.18 362.844C377.136 360.583 351.234 356.935 326.199 348.868C322.305 347.614 318.448 346.134 314.768 344.36C307.692 340.944 307.354 339.194 312.748 331.963C308.507 330.996 304.673 329.187 300.965 329.42C262.38 331.832 223.835 334.845 185.245 337.139C150.3 339.217 115.254 340.354 81.0777 348.774C71.7379 351.076 62.8737 355.307 53.7665 358.587C52.5095 359.039 51.1141 359.101 49.7813 359.344C49.9459 357.933 49.6585 356.227 50.3536 355.158C53.858 349.754 57.6158 344.514 61.2849 339.214L62.8371 337.443L59.8632 337.631C54.0984 339.259 48.344 340.924 42.5635 342.486C41.2725 342.836 39.8823 342.829 38.5391 342.985C38.7586 341.783 38.7743 340.5 39.229 339.395C57.8981 293.814 88.7972 260.302 135.682 243.154C153.865 236.503 172.534 231.177 190.923 225.075C192.008 224.715 193.55 222.381 193.244 221.683C185.961 205.11 178.455 188.636 170.989 172.144C169.604 166.311 168.536 160.379 166.774 154.661C160.246 133.447 156.062 112.159 159.099 89.6589C161.433 72.3748 161.971 54.8503 163.312 37.4329C163.51 34.8536 163.625 32.2587 163.988 29.7029C164.527 25.9294 166.338 24.5731 170.305 26.0208C176.587 28.31 183.076 30.0191 189.392 32.2195L202.416 36.1184C255.089 52.7283 307.84 69.1082 360.354 86.2067C415.342 104.11 470.098 122.727 524.955 141.033L537.925 145.23C546.402 148.272 553.928 150.856 561.358 153.689C568.126 156.202 629.743 173.161 635.073 177.807C640.403 181.823 638.404 187.131 637.738 193.815L636.406 201.143Z"
        fill="#FF7A00"
      />
      <path
        d="M176.873 69.5075C175.985 81.9832 175.161 94.4668 174.189 106.935C172.948 122.894 175.214 138.534 180.937 153.252C191.327 179.973 202.93 206.207 218.96 230.191C242.779 265.828 277.248 286.737 317.093 299.221C368.668 315.378 420.896 315.825 472.987 301.489C495.356 295.332 515.834 284.848 535.072 271.659C557.737 256.12 580.007 240.268 597.289 218.544C603.328 210.953 608.594 202.737 614.75 195.247C618.396 190.812 622.763 186.793 627.404 183.409C631.912 180.124 633.895 181.462 633.589 187.13C632.241 212.176 625.739 235.436 610.603 256C563.985 319.335 499.882 347.927 422.841 350.433C386.367 351.619 350.866 345.41 317.056 331.698C261.671 309.24 221.766 269.759 194.27 217.217C179.053 188.136 168.265 157.337 162.824 125.102C160.464 111.121 162.445 96.3274 163.114 81.9336C163.846 66.2044 165.302 50.5065 166.566 34.8035C166.705 33.0892 167.661 31.4428 168.239 29.7651C169.728 30.9019 171.952 31.7381 172.561 33.2355C174.166 37.1606 175.807 41.3235 176.092 45.4839C176.635 53.4386 176.251 61.4587 176.251 69.4501C176.458 69.4684 176.664 69.4866 176.87 69.5075H176.873Z"
        fill="#FF9533"
      />
    </svg>
  )
}

function BlobShape({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M280 40C330 60 380 120 370 190C360 260 310 310 240 320C170 330 100 300 60 240C20 180 10 110 50 65C90 20 230 20 280 40Z"
        fill="currentColor"
      />
    </svg>
  )
}

interface FeaturedDropSectionProps {
  drop?: Drop | null
  products?: Product[]
}

export function AnniversaryDropSection({ drop, products = [] }: FeaturedDropSectionProps) {
  // Hide entirely if no featured drop is configured in the CMS
  if (!drop) return null

  const featured = products[0]
  const bg = drop.background_color || "#FF7A00"
  const dropName = drop.name || "to zoyme raw"
  const dropTagline = drop.tagline
  const dropDescription =
    drop.description ||
    "Χειροποίητο κερί σόγιας εμπνευσμένο από τους πορτοκαλεώνες της Ελλάδας. Limited edition, φτιαγμένο με αγάπη."

  return (
    <section
      className="relative py-24 md:py-36 overflow-hidden z-10"
      style={{ backgroundColor: bg }}
      id="drops"
    >
      <LeafDecoration className="absolute -top-6 -left-10 w-44 md:w-56 opacity-50 pointer-events-none animate-float-slow" />
      <LeafDecoration className="absolute top-16 -right-8 w-36 md:w-48 opacity-40 pointer-events-none rotate-[140deg] animate-float-slower" />
      <LeafDecoration className="absolute -bottom-4 -left-6 w-40 md:w-52 opacity-35 pointer-events-none -rotate-[50deg] animate-float" />
      <LeafDecoration className="absolute bottom-12 -right-12 w-48 md:w-56 opacity-40 pointer-events-none rotate-[110deg] animate-float-slow" />
      <LeafDecoration className="absolute top-1/3 right-1/4 w-24 md:w-32 opacity-20 pointer-events-none rotate-45 animate-float-slower" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] text-white/10 pointer-events-none">
        <BlobShape className="w-full h-full" />
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="-ml-4"
        >
          <h2 className="text-[28vw] md:text-[22vw] font-light tracking-tighter whitespace-nowrap leading-none text-white opacity-[0.07]">
            {drop.slug || "limited"}
          </h2>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center order-2 lg:order-1"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <BlobShape className="w-[90%] h-[90%] text-white/10" />
            </div>

            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <OrangeSliceDecoration className="absolute -bottom-8 -left-8 w-32 md:w-40 opacity-80 drop-shadow-lg" />
              <OrangeSliceDecoration className="absolute -top-4 -right-4 w-20 md:w-24 opacity-50 rotate-45" />

              <div className="relative w-full h-full rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden">
                {featured?.images?.[0]?.url || drop.hero_image_url ? (
                  <Image
                    src={featured?.images?.[0]?.url || drop.hero_image_url!}
                    alt={featured?.name || dropName}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                    priority
                  />
                ) : (
                  <OrangeSliceDecoration className="w-32 md:w-40 mx-auto drop-shadow-lg" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 text-center lg:text-left"
          >
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white caption">
                ✿ {drop.badge_text || "featured drop"} ✿
              </span>
            </div>

            <h2 className="headline-lg text-white mb-4">{dropName}</h2>
            {dropTagline && (
              <p className="headline-sm text-white/90 mb-3">{dropTagline}</p>
            )}

            <p className="body-md text-white/75 mb-8 max-w-lg mx-auto lg:mx-0">
              {dropDescription}
            </p>

            {featured && (
              <div className="flex items-center gap-6 mb-8 justify-center lg:justify-start">
                <div>
                  <span className="caption text-[#ffc107]">τιμή</span>
                  <p className="headline-sm text-white">
                    {formatPrice(featured.sale_price ?? featured.price)}
                  </p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <span className="caption text-[#ffc107]">edition</span>
                  <p className="headline-sm text-white">limited</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
              {featured && (
                <Link
                  href={`/products/${featured.slug}`}
                  className="caption inline-block bg-white text-[#502e23] px-8 py-3.5 rounded-full hover:bg-white/90 transition-all hover:scale-105 font-medium uppercase tracking-wide shadow-lg"
                >
                  αγόρασε τώρα
                </Link>
              )}
              <Link
                href="/products"
                className="caption inline-block border-2 border-white/30 text-white px-8 py-3.5 rounded-full hover:bg-white/10 transition-all hover:scale-105 font-medium uppercase tracking-wide"
              >
                όλα τα κεριά
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </section>
  )
}
