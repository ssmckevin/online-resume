'use client'

import { useState, useEffect } from 'react'
import { Tweet, Resume } from '@/app/lib/db'

interface ResumeFormProps {
  onResumeUpdated?: () => void
}

export default function ResumeForm({ onResumeUpdated }: ResumeFormProps) {
  const [resume, setResume] = useState<Resume | null>(null)
  const [tweets, setTweets] = useState<Tweet[]>([{ tweet_link: '', notes: '' }])
  const [loading, setLoading] = useState(false)
  const [fetchingResume, setFetchingResume] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch existing resume on component mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch('/api/resume')
        const data = await response.json()
        
        if (response.ok && data.resume) {
          setResume(data.resume)
          setTweets(data.resume.tweets.length > 0 ? data.resume.tweets : [{ tweet_link: '', notes: '' }])
        } else {
          // No resume exists, start with empty form
          setTweets([{ tweet_link: '', notes: '' }])
        }
      } catch (err) {
        console.error('Error fetching resume:', err)
        setError('Failed to load resume')
      } finally {
        setFetchingResume(false)
      }
    }

    fetchResume()
  }, [])

  const addTweet = () => {
    setTweets([...tweets, { tweet_link: '', notes: '' }])
  }

  const removeTweet = (index: number) => {
    if (tweets.length > 1) {
      setTweets(tweets.filter((_, i) => i !== index))
    }
  }

  const updateTweet = (index: number, field: keyof Tweet, value: string) => {
    const updatedTweets = tweets.map((tweet, i) => 
      i === index ? { ...tweet, [field]: value } : tweet
    )
    setTweets(updatedTweets)
  }

  const validateTweets = () => {
    const validTweets = tweets.filter(tweet => tweet.tweet_link.trim() !== '')
    if (validTweets.length === 0) {
      setError('At least one tweet link is required')
      return false
    }

    // Basic URL validation
    for (const tweet of validTweets) {
      try {
        new URL(tweet.tweet_link)
      } catch {
        setError('Please enter valid URLs for tweet links')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateTweets()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Filter out empty tweets
      const validTweets = tweets.filter(tweet => tweet.tweet_link.trim() !== '')
      
      const method = resume ? 'PUT' : 'POST'
      const response = await fetch('/api/resume', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweets: validTweets }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save resume')
      }

      // Success!
      setResume(data.resume)
      setSuccess(resume ? 'Resume updated successfully!' : 'Resume created successfully!')
      onResumeUpdated?.()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!resume || !confirm('Are you sure you want to delete your entire resume? This cannot be undone.')) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/resume', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete resume')
      }

      // Success!
      setResume(null)
      setTweets([{ tweet_link: '', notes: '' }])
      setSuccess('Resume deleted successfully!')
      onResumeUpdated?.()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingResume) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading resume...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {resume ? 'Edit Resume' : 'Create Resume'}
          </h2>
          <p className="text-gray-600">
            Add tweet links to showcase your thoughts and insights
          </p>
        </div>
        {resume && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Delete Resume
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {tweets.map((tweet, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-800">Tweet #{index + 1}</h3>
              {tweets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTweet(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tweet Link *
                </label>
                <input
                  type="url"
                  value={tweet.tweet_link}
                  onChange={(e) => updateTweet(index, 'tweet_link', e.target.value)}
                  placeholder="https://twitter.com/username/status/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={tweet.notes || ''}
                  onChange={(e) => updateTweet(index, 'notes', e.target.value)}
                  placeholder="Add your thoughts about this tweet..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={addTweet}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Add Another Tweet
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading 
              ? (resume ? 'Updating...' : 'Creating...') 
              : (resume ? 'Update Resume' : 'Create Resume')
            }
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
            {success}
          </div>
        )}
      </form>
    </div>
  )
}

