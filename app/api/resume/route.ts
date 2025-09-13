import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { createClerkSupabaseClient } from "@/app/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const { tweets } = await request.json()
    
    if (!tweets || !Array.isArray(tweets)) {
      return NextResponse.json({ error: "Tweets array is required" }, { status: 400 })
    }

    // Validate tweets structure
    for (const tweet of tweets) {
      if (!tweet.tweet_link || typeof tweet.tweet_link !== 'string') {
        return NextResponse.json({ error: "Each tweet must have a tweet_link" }, { status: 400 })
      }
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // First, get the user profile ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check if user already has a resume
    const { data: existingResume } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_profile_id', userProfile.id)
      .single()

    if (existingResume) {
      return NextResponse.json({ error: "Resume already exists. Use PUT to update." }, { status: 409 })
    }

    // Create new resume
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_profile_id: userProfile.id,
        tweets: tweets,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating resume:', error)
      return NextResponse.json({ error: "Failed to create resume" }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume: data })

  } catch (error) {
    console.error('Error in resume POST API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Get the user profile ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Get user's resume
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_profile_id', userProfile.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching resume:', error)
      return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 })
    }

    return NextResponse.json({ resume })

  } catch (error) {
    console.error('Error in resume GET API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const { tweets } = await request.json()
    
    if (!tweets || !Array.isArray(tweets)) {
      return NextResponse.json({ error: "Tweets array is required" }, { status: 400 })
    }

    // Validate tweets structure
    for (const tweet of tweets) {
      if (!tweet.tweet_link || typeof tweet.tweet_link !== 'string') {
        return NextResponse.json({ error: "Each tweet must have a tweet_link" }, { status: 400 })
      }
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Get the user profile ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Update the resume
    const { data, error } = await supabase
      .from('resumes')
      .update({ 
        tweets: tweets,
        updated_at: new Date().toISOString()
      })
      .eq('user_profile_id', userProfile.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Resume not found. Use POST to create." }, { status: 404 })
      }
      console.error('Error updating resume:', error)
      return NextResponse.json({ error: "Failed to update resume" }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume: data, message: "Resume updated successfully" })

  } catch (error) {
    console.error('Error in resume PUT API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Get the user profile ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Delete the resume
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('user_profile_id', userProfile.id)

    if (error) {
      console.error('Error deleting resume:', error)
      return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Resume deleted successfully" })

  } catch (error) {
    console.error('Error in resume DELETE API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

