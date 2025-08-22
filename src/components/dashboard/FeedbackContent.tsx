'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  IconSearch, 
  IconChevronDown, 
  IconPlus,
  IconMessageCircle,
  IconCheck,
  IconX,
  IconCircle
} from '@tabler/icons-react';

const mockPosts = [
  { id: '1', title: 'Android app', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'In Review', board: 'Feature Requests' },
  { id: '2', title: 'Web app', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'In Review', board: 'Feature Requests' },
  { id: '3', title: 'Offline support', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'In Review', board: 'Feature Requests' },
  { id: '4', title: 'Workout planner', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'In Review', board: 'Feature Requests' },
  { id: '5', title: 'Voting system', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'In Review', board: 'Feature Requests' },
  { id: '6', title: 'Place leaderboard', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'In Review', board: 'Feature Requests' },
  { id: '7', title: 'Custom private skill', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'Planned', board: 'Feature Requests' },
  { id: '8', title: 'Workout places', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'Planned', board: 'Feature Requests' },
  { id: '9', title: 'Skill variants', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'Planned', board: 'Feature Requests' },
  { id: '10', title: 'Skill prerequisites', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'Planned', board: 'Feature Requests' },
  { id: '11', title: 'Skill Tree', votes: 1, date: '17 Jun', type: 'Feature Request', status: 'Planned', board: 'Feature Requests' },
];

const statuses = [
  { name: 'Under Review', color: 'bg-gray-500', icon: IconCircle },
  { name: 'Planned', color: 'bg-purple-500', icon: IconCircle },
  { name: 'Active', color: 'bg-blue-500', icon: IconCircle },
  { name: 'Done', color: 'bg-green-500', icon: IconCheck },
  { name: 'Closed', color: 'bg-red-500', icon: IconX },
];

export function FeedbackContent() {
  const [selectedStatus, setSelectedStatus] = useState('Done');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Review': return 'bg-blue-500';
      case 'Planned': return 'bg-purple-500';
      case 'Active': return 'bg-green-500';
      case 'Done': return 'bg-green-500';
      case 'Closed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-gray-50/50">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <IconMessageCircle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Feedback</h2>
          </div>

          {/* Statuses */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Statuses</h3>
            <div className="space-y-2">
              {statuses.map((status) => (
                <label key={status.name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status.name}
                    checked={selectedStatus === status.name}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-3 h-3 rounded-full ${status.color} flex items-center justify-center`}>
                    {selectedStatus === status.name && <status.icon className="w-2 h-2 text-white" />}
                  </div>
                  <span className="text-sm text-gray-600">{status.name}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Quick Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-sm text-gray-600">Boards</span>
                </div>
                <IconChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-sm text-gray-600">Tags</span>
                </div>
                <IconChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* More */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">More</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-sm text-gray-600">AI Tools</span>
                </div>
                <IconChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-sm text-gray-600">Analytics</span>
                </div>
                <IconChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Posts ({mockPosts.length})</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <IconPlus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              Filters
              <IconChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              Recent posts
              <IconChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Posts List */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="space-y-2">
              {mockPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-1 text-gray-600">
                    <IconMessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{post.votes}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{post.date}</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      💡 {post.type}
                    </Badge>
                    <Badge 
                      className={`text-white ${getStatusColor(post.status)}`}
                    >
                      {post.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
