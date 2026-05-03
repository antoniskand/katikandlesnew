export function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift()
    return cookieValue || null
  }
  return null
}

export function setCookie(name: string, value: string, days = 30): void {
  if (typeof window === "undefined") return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

export function deleteCookie(name: string): void {
  if (typeof window === "undefined") return

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}
