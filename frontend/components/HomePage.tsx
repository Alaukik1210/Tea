'use client';

import { Search, Bell, Mail, Bookmark, User, MoreHorizontal, Home, Hash, Users, Repeat2, Heart, MessageCircle, Share, TrendingUp, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={`h-screen ${isDark ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-900'} overflow-hidden transition-colors duration-300`}>
      <div className="flex justify-center h-full mx-auto max-w-7xl">
        {/* Left Navigation */}
        <div className={`w-1/4 lg:w-1/4 md:w-20 sm:w-16 h-full ${isDark ? 'border-gray-800' : 'border-gray-200'} border-r px-4 md:px-2 overflow-y-auto hidden md:block`}>
          <div className="sticky top-0 pt-2">
            <div className="flex items-center justify-between mb-6">
              <div className="text-3xl font-bold px-3 md:text-center md:px-0">BKC</div>
              <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-purple-600" />}
              </button>
            </div>
            
            <nav className="space-y-2">
              <NavItem icon={<Home size={26} />} text="Home" active isDark={isDark} />
              <NavItem icon={<Search size={26} />} text="Explore" isDark={isDark} />
              <NavItem icon={<Bell size={26} />} text="Notifications" isDark={isDark} />
              <NavItem icon={<Mail size={26} />} text="Messages" isDark={isDark} />
              <NavItem icon={<Bookmark size={26} />} text="Bookmarks" isDark={isDark} />
              <NavItem icon={<Users size={26} />} text="Communities" isDark={isDark} />
              <NavItem icon={<User size={26} />} text="Profile" isDark={isDark} />
              <NavItem icon={<MoreHorizontal size={26} />} text="More" isDark={isDark} />
            </nav>
            <div className='flex flex-col mt-72'>

            <button className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-4 md:px-0 rounded-full mt-4 lg:block md:flex md:justify-center">
              <span className="lg:inline md:hidden">Post</span>
              <span className="lg:hidden md:inline hidden">+</span>
            </button>

            <div className="mt-auto pt-4 pb-4 lg:block md:hidden">
              <div className={`flex items-center justify-between p-3 ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} rounded-full cursor-pointer`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-full`}></div>
                  <div className="text-sm">
                    <div className="font-bold">Alaukik</div>
                    <div className={`${isDark ? 'text-gray-500' : 'text-gray-600'}`}>@Alaukikkkk</div>
                  </div>
                </div>
                <MoreHorizontal size={20} />
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Center Thread with Custom Design */}
        <div className={`flex-1 lg:w-2/5 h-full border-r ${isDark ? 'border-gray-800' : 'border-gray-200'} overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
          {/* Header */}
          <div className={`sticky top-0 ${isDark ? 'bg-[#1A1A1A]/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-sm border-b p-4 z-10`}>
            <h2 className="text-xl font-bold">Home</h2>
          </div>

          {/* Custom Profile Card */}
          <div className={`bg-gradient-to-b from-purple-600  ${isDark ? 'to-[#1A1A1A]' : 'to *:-gray-200'} p-6 m-4 rounded-3xl  `}>
            <div className="flex items-center justify-between bg-[#1A1A1A]/30 backdrop-blur-sm rounded-full p-4 mb-6 ">
              <div className="flex items-center gap-3 ">
                <div className="w-4 h-12 ">
                  
                </div>
                <div >
                  <div className="font-bold text-white">Zachary Nelson</div>
                  <div className="text-sm text-purple-200">@zachary</div>
                  <div className="text-xs text-purple-200">Traveller || photographer</div>
                </div>
              </div>
              <div className="w-20 h-20 bg-gray-800 rounded-full overflow-hidden">
                {/* <img src="/api/placehol der/64/64" alt="Avatar" className="w-full h-full object-cover" /> */}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#1A1A1A]/30 backdrop-blur-sm rounded-2xl p-4 flex-1">
                <div className="flex items-center justify-center mb-2">
                  <div className="relative">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <polygon points="40,10 50,30 70,30 55,45 60,65 40,52 20,65 25,45 10,30 30,30" 
                               fill="none" stroke="#FFD700" strokeWidth="3"/>
                      <polygon points="40,20 45,32 57,32 48,40 52,52 40,44 28,52 32,40 23,32 35,32" 
                               fill="none" stroke="#FFD700" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div className="text-center text-yellow-400 font-bold text-lg">DIAMOND III</div>
                <div className="text-center border-t border-purple-400/30 pt-3">
                  <div className="text-3xl font-bold text-yellow-400">607</div>
                  <div className="text-sm text-purple-200 font-semibold">BKC Points</div>
                </div>
              </div>

              <div className="space-y-4 flex-1 ml-4 bg-[#1A1A1A]/30 backdrop-blur-sm rounded-2xl p-4 flex flex-col justify-between h-full">
                <div className="flex justify-between">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">40</div>
                    <div className="text-xs text-purple-200">Followers</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">40</div>
                    <div className="text-xs text-purple-200">Following</div>
                  </div>
                </div>
                 <div className="flex justify-between">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">40</div>
                    <div className="text-xs text-purple-200">Threads</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">40</div>
                    <div className="text-xs text-purple-200">likes</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-center flex-1">
                    <div className="text-2xl text-yellow-300 font-bold">25</div>
                    <div className="text-xs text-purple-200">Debates Won</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-2xl text-yellow-300 font-bold">48</div>
                    <div className="text-xs text-purple-200">Participated</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-full">
                Edit profile
              </button>
              <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-full">
                Share profile
              </button>
            </div>

            <div className="flex gap-4 mt-6 border-t border-purple-400/30 pt-4">
              <button className="flex-1 text-white font-semibold">Threads</button>
              <button className="flex-1 text-purple-300">Replies</button>
            </div>
          </div>

          {/* Thread Posts */}
          <ThreadPost 
            name="Zachary Nelson"
            handle="@zachary"
            time="11 h"
            content="Designed by the PMMT Designer team, this is for educational purposes only and this design will not be used in any way."
            likes="591 replies 1,792 likes"
          />
          
          <ThreadPost 
            name="Zachary Nelson"
            handle="@zachary"
            time="11 h"
            content="Designed by the PMMT Designer team, this is for educational purposes only and this design will not be used in any way."
            likes="591 replies 1,792 likes"
          />
          <ThreadPost 
            name="Zachary Nelson"
            handle="@zachary"
            time="11 h"
            content="Designed by the PMMT Designer team, this is for educational purposes only and this design will not be used in any way."
            likes="591 replies 1,792 likes"
          />

          {/* Regular X-style posts below */}
          <div className="border-b border-gray-800 p-4 hover:bg-gray-900/30 cursor-pointer">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              
          </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-1/3 lg:w-1/3 h-full px-4 py-2 hidden lg:block overflow-y-auto">
          <div className={`sticky top-0 ${isDark ? 'bg-[#1A1A1A]' : 'bg-white'} pt-2`}>
            <div className={`border ${isDark ? 'border-gray-500' : 'border-gray-300'} rounded-full px-4 py-3 flex items-center gap-3 mb-4`}>
              <Search size={20} className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input 
                type="text" 
                placeholder="Search" 
                className={`bg-transparent outline-none w-full text-sm ${isDark ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'}`}
              />
            </div>

            <div className={`border ${isDark ? 'border-gray-500' : 'border-gray-300'} rounded-2xl p-4 mb-4`}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={24} className="text-purple-500" />
                Current Debates
              </h2>
              <DebateItem 
                title="Climate Change Policies"
                participants="2.5K"
                status="Live"
                category="Environment"
              />
              <DebateItem 
                title="AI Ethics & Regulation"
                participants="1.8K"
                status="Live"
                category="Technology"
              />
              <DebateItem 
                title="Universal Basic Income"
                participants="3.2K"
                status="Live"
                category="Economics"
              />
              <button className="text-purple-500 hover:underline mt-2">Show more</button>
            </div>

            <div className={`border ${isDark ? 'border-gray-500' : 'border-gray-300'} rounded-2xl p-4`}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart size={24} className="text-red-500" />
                Hottest Debates
              </h2>
              <HotDebateItem 
                title="Free Speech vs Hate Speech"
                engagement="15.2K"
                likes="8.5K"
                comments="6.7K"
              />
              <HotDebateItem 
                title="Remote Work vs Office Culture"
                engagement="12.8K"
                likes="7.2K"
                comments="5.6K"
              />
              <HotDebateItem 
                title="Cryptocurrency Future"
                engagement="11.4K"
                likes="6.8K"
                comments="4.6K"
              />
              <HotDebateItem 
                title="Education System Reform"
                engagement="9.3K"
                likes="5.1K"
                comments="4.2K"
              />
              <button className="text-purple-500 hover:underline mt-2">Show more</button>
            </div>

            {/* Footer */}
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'} space-y-2`}>
                <div className="flex flex-wrap gap-2">
                  <a href="#" className="hover:text-purple-500 transition">Terms of Service</a>
                  <span>|</span>
                  <a href="#" className="hover:text-purple-500 transition">Privacy Policy</a>
                  <span>|</span>
                  <a href="#" className="hover:text-purple-500 transition">Cookie Policy</a>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="#" className="hover:text-purple-500 transition">Accessibility</a>
                  <span>|</span>
                  <a href="#" className="hover:text-purple-500 transition">Ads info</a>
                  <span>|</span>
                  <a href="#" className="hover:text-purple-500 transition">More</a>
                </div>
                <div className="pt-2">
                  © 2025 Debate Forum
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, text, active = false, isDark }: { icon: React.ReactNode; text: string; active?: boolean; isDark: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-3 py-3 rounded-full cursor-pointer ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} ${active ? 'font-bold' : ''}`}>
      {icon}
      <span className="text-xl lg:inline md:hidden">{text}</span>
    </div>
  );
}

function ThreadPost({ name, handle, time, content, likes }: { name: string; handle: string; time: string; content: string; likes: string }) {
  return (
    <div className="border-b border-gray-800 p-4 hover:bg-gray-900/30">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-full overflow-hidden">
          <img src="/api/placeholder/40/40" alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-purple-400">{name}</span>
            <span className="font-extralight text-gray-400">{handle}</span>
            <span className="text-gray-500 text-sm">{time}</span>
            <MoreHorizontal size={16} className="ml-auto text-gray-500" />
          </div>
          <p className="text-sm leading-relaxed mb-3">{content}</p>
          <div className="flex gap-4 text-gray-500 text-sm mb-2">
            <button className="hover:text-purple-400"><Heart size={18} /></button>
            <button className="hover:text-purple-400"><MessageCircle size={18} /></button>
            <button className="hover:text-purple-400"><Repeat2 size={18} /></button>
            <button className="hover:text-purple-400"><Share size={18} /></button>
          </div>
          <div className="text-xs text-gray-500">{likes}</div>
        </div>
      </div>
    </div>
  );
}

function SuggestionItem({ name, handle, verified = false }: { name: string; handle: string; verified?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm">{name}</span>
            {verified && <span className="text-purple-500">✓</span>}
          </div>
          <div className="text-gray-500 text-sm">{handle}</div>
        </div>
      </div>
      <button className="bg-white text-[#1A1A1A] font-bold px-4 py-1.5 rounded-full text-sm hover:bg-gray-200">
        Follow
      </button>
    </div>
  );
}

function TrendingItem({ category, hashtag, posts }: { category: string; hashtag: string; posts: string }) {
  return (
    <div className="py-3 hover:bg-gray-800/50 cursor-pointer">
      <div className="flex justify-between">
        <div className="text-xs text-gray-500">{category}</div>
        <MoreHorizontal size={16} className="text-gray-500" />
      </div>
      <div className="font-bold mt-1">{hashtag}</div>
      {posts && <div className="text-xs text-gray-500 mt-1">{posts}</div>}
    </div>
  );
}

function DebateItem({ title, participants, status, category }: { title: string; participants: string; status: string; category: string }) {
  return (
    <div className="py-3 hover:bg-gray-800/50 rounded-lg px-2 cursor-pointer border-b border-gray-700/50">
      <div className="flex justify-between items-start mb-1">
        <div className="text-xs text-purple-400 font-semibold">{category}</div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-red-400">{status}</span>
        </div>
      </div>
      <div className="font-bold text-sm mt-1">{title}</div>
      <div className="flex items-center gap-2 mt-2">
        <Users size={14} className="text-gray-500" />
        <span className="text-xs text-gray-400">{participants} participants</span>
      </div>
    </div>
  );
}

function HotDebateItem({ title, engagement, likes, comments }: { title: string; engagement: string; likes: string; comments: string }) {
  return (
    <div className="py-3 hover:bg-gray-800/50 rounded-lg px-2 cursor-pointer border-b border-gray-700/50">
      <div className="font-bold text-sm mb-2">{title}</div>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Heart size={14} className="text-red-500" />
          <span>{likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={14} className="text-blue-500" />
          <span>{comments}</span>
        </div>
        <div className="ml-auto">
          <span className="text-purple-400 font-semibold">{engagement} engaged</span>
        </div>
      </div>
    </div>
  );
}