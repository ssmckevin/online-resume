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
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center">
            {/* Avatar placeholder */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {profile.username}
            </h1>
            
            <p className="text-gray-600 mb-4">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Username</span>
              <p className="font-medium text-gray-800">{profile.username}</p>
            </div>
            <div>
              <span className="text-gray-500">Member since</span>
              <p className="font-medium text-gray-800">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
            {profile.resume_created_at && (
              <div>
                <span className="text-gray-500">Resume last updated</span>
                <p className="font-medium text-gray-800">
                  {new Date(profile.resume_created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
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

