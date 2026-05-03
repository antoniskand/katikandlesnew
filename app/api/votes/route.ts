import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET handler to fetch voting options and results
export async function GET() {
  try {
    // Fetch voting options
    const { data: options, error: optionsError } = await supabase.from("voting_options").select("*").order("id")

    if (optionsError) throw optionsError

    // Fetch custom suggestions
    const { data: customSuggestions, error: suggestionsError } = await supabase
      .from("custom_suggestions")
      .select("*")
      .order("votes", { ascending: false })

    if (suggestionsError) throw suggestionsError

    return NextResponse.json({
      options: options || [],
      customSuggestions: customSuggestions || [],
    })
  } catch (error) {
    console.error("Error fetching vote data:", error)
    return NextResponse.json({ error: "Failed to fetch voting options" }, { status: 500 })
  }
}

// POST handler to submit votes
export async function POST(request: Request) {
  try {
    const { selectedOptions, customSuggestion } = await request.json()

    if ((!selectedOptions || selectedOptions.length === 0) && !customSuggestion) {
      return NextResponse.json({ error: "No votes or suggestions provided" }, { status: 400 })
    }

    // Process selected options
    if (selectedOptions && selectedOptions.length > 0) {
      for (const optionId of selectedOptions) {
        // Get current vote count
        const { data: option } = await supabase.from("voting_options").select("votes").eq("id", optionId).single()

        if (option) {
          // Increment vote count
          const { error } = await supabase
            .from("voting_options")
            .update({ votes: option.votes + 1 })
            .eq("id", optionId)

          if (error) throw error
        }
      }
    }

    // Process custom suggestion if provided
    if (customSuggestion) {
      // Check if this suggestion already exists
      const { data: existingSuggestion } = await supabase
        .from("custom_suggestions")
        .select("*")
        .ilike("suggestion", customSuggestion)
        .single()

      if (existingSuggestion) {
        // Increment vote count for existing suggestion
        const { error } = await supabase
          .from("custom_suggestions")
          .update({ votes: existingSuggestion.votes + 1 })
          .eq("id", existingSuggestion.id)

        if (error) throw error
      } else {
        // Add new suggestion
        const { error } = await supabase.from("custom_suggestions").insert({ suggestion: customSuggestion, votes: 1 })

        if (error) throw error
      }
    }

    // Fetch updated data to return
    const { data: updatedOptions } = await supabase.from("voting_options").select("*").order("id")

    const { data: updatedSuggestions } = await supabase
      .from("custom_suggestions")
      .select("*")
      .order("votes", { ascending: false })

    return NextResponse.json({
      options: updatedOptions || [],
      customSuggestions: updatedSuggestions || [],
    })
  } catch (error) {
    console.error("Error submitting vote:", error)
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 })
  }
}
