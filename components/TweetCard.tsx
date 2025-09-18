'use client'

import { Tweet } from 'react-tweet'
import { extractTweetId } from '@/app/lib/utils'

interface TweetItem {
  tweet_link: string
  notes?: string
}

interface TweetCardProps {
  tweetItem: TweetItem
  index: number
}

export default function TweetCard({ tweetItem, index }: TweetCardProps) {
  const tweetId = extractTweetId(tweetItem.tweet_link)
  
  // Handle invalid tweet URL
  if (!tweetId) {
    return (
      <div 
        className="border rounded-2xl p-6"
        style={{
          background: '#fed7d7',
          borderColor: '#feb2b2',
          color: '#c53030'
        }}
      >
        <p className="text-sm font-medium">
          Invalid tweet URL: {tweetItem.tweet_link}
        </p>
        {tweetItem.notes && (
          <p className="text-sm mt-3" style={{ color: 'var(--foreground-secondary)' }}>
            <strong>Note:</strong> {tweetItem.notes}
          </p>
        )}
      </div>
    )
  }
  
  return (
    <div className="tweet-card">
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
}
