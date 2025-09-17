'use client'

import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import { Tweet } from 'react-tweet'

interface TweetItem {
  tweet_link: string
  notes?: string
}

interface UserProfile {
  id: string
  username: string
  created_at: string
  tweets: TweetItem[]
  resume_created_at?: string
}

// Helper function to extract tweet ID from URL
function extractTweetId(url: string): string | null {
  try {
    const regex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
    const match = url.match(regex)
    return match ? match[1] : null
  } catch {
    return null
  }
}

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${resolvedParams.username}`)
        
        if (response.status === 404) {
          notFound()
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        
        const data = await response.json()
        setProfile(data.profile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (resolvedParams.username) {
      fetchProfile()
    }
  }, [resolvedParams.username])

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </main>
    )
  }

  if (!profile) {
    return notFound()
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            {profile.username}
          </h1>
        </div>


        {/* Tweets Section */}
        <div className="space-y-8">
          {profile.tweets && profile.tweets.length > 0 ? (
            <>
              <div className="flex flex-col gap-4">
                {profile.tweets.map((tweetItem, index) => {
                  const tweetId = extractTweetId(tweetItem.tweet_link)
                  
                  if (!tweetId) {
                    return (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">
                          Invalid tweet URL: {tweetItem.tweet_link}
                        </p>
                        {tweetItem.notes && (
                          <p className="text-gray-600 text-sm mt-2">
                            <strong>Note:</strong> {tweetItem.notes}
                          </p>
                        )}
                      </div>
                    )
                  }
                  
                  return (
                    <div key={index} className="tweet-card">
                      {/* Tweet embed */}
                      <div className="tweet-embed">
                        <Tweet id={tweetId} />
                      </div>
                      
                      {/* User's note (if exists) */}
                      {tweetItem.notes && (
                        <div className="tweet-note">
                          {tweetItem.notes}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  No tweets yet
                </h2>
                <p className="text-gray-600">
                  {profile.username} hasn&apos;t shared any tweets yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

