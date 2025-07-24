/**
 * YouTube Music Auto-Like Script
 * Automatically likes all songs in a playlist on YouTube Music
 * 
 * Usage: Open YouTube Music playlist, open browser console, paste and run this script
 * 
 * Features:
 * - Configurable delays and timeouts
 * - Progress tracking and detailed logging
 * - Safety checks to prevent infinite loops
 * - Graceful error handling
 * - Ability to stop the script manually
 */

class YouTubeMusicAutoLike {
    constructor(options = {}) {
        this.config = {
            // Random delay range between liking individual songs (milliseconds)
            likeDelayMin: options.likeDelayMin || 1200, // 1.2 seconds
            likeDelayMax: options.likeDelayMax || 2300, // 2.3 seconds
            // Delay between scroll cycles (milliseconds)
            scrollDelay: options.scrollDelay || 5000,
            // Scroll distance in pixels
            scrollDistance: options.scrollDistance || 1000,
            // Maximum number of scroll attempts to prevent infinite loops
            maxScrollAttempts: options.maxScrollAttempts || 100,
            // Time to wait for new content to load after scrolling (milliseconds)
            loadWaitTime: options.loadWaitTime || 2000,
            // Enable detailed logging
            verbose: options.verbose !== false
        };
        
        this.stats = {
            totalLiked: 0,
            scrollAttempts: 0,
            startTime: Date.now()
        };
        
        this.isRunning = false;
        this.shouldStop = false;
        
        // Bind methods to maintain context
        this.stop = this.stop.bind(this);
        this.getStatus = this.getStatus.bind(this);
    }

    log(message, type = 'info') {
        if (!this.config.verbose && type === 'debug') return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] YT Auto-Like:`;
        
        switch (type) {
            case 'error':
                console.error(`${prefix} ❌ ${message}`);
                break;
            case 'success':
                console.log(`${prefix} ✅ ${message}`);
                break;
            case 'warning':
                console.warn(`${prefix} ⚠️ ${message}`);
                break;
            case 'debug':
                console.log(`${prefix} 🔍 ${message}`);
                break;
            default:
                console.log(`${prefix} ℹ️ ${message}`);
        }
    }

    // Get all like buttons that haven't been liked yet
    getLikeButtons() {
        // Multiple selectors to handle different YouTube Music versions
        const selectors = [
            'tp-yt-paper-icon-button[aria-label="Like"]',
            'button[aria-label="Like"]',
            'yt-icon-button[aria-label="Like"]',
            '[data-tooltip-text="Like"]'
        ];
        
        let buttons = [];
        for (const selector of selectors) {
            const foundButtons = document.querySelectorAll(selector);
            if (foundButtons.length > 0) {
                buttons = Array.from(foundButtons);
                this.log(`Found ${buttons.length} like buttons using selector: ${selector}`, 'debug');
                break;
            }
        }
        
        // Filter out already liked buttons
        return buttons.filter(button => {
            const isPressed = button.getAttribute('aria-pressed') === 'true';
            const isDisabled = button.disabled || button.getAttribute('disabled') !== null;
            const isAlreadyLiked = button.getAttribute('aria-label')?.includes('Remove from liked');
            
            return !isPressed && !isDisabled && !isAlreadyLiked;
        });
    }

    // Like all currently visible songs
    async likeVisibleSongs() {
        const likeButtons = this.getLikeButtons();
        
        if (likeButtons.length === 0) {
            this.log('No unliked songs found on current view', 'debug');
            return 0;
        }

        this.log(`Found ${likeButtons.length} songs to like`);
        
        let likedCount = 0;
        
        for (let i = 0; i < likeButtons.length && !this.shouldStop; i++) {
            const button = likeButtons[i];
            
            try {
                // Double-check button is still valid
                if (button.getAttribute('aria-pressed') === 'false' && !button.disabled) {
                    // Find song title for better logging
                    const songElement = button.closest('[data-testid*="song"]') || 
                                      button.closest('.song-info') ||
                                      button.closest('.ytmusic-responsive-list-item-renderer');
                    
                    let songTitle = 'Unknown Song';
                    if (songElement) {
                        const titleElement = songElement.querySelector('[title]') || 
                                           songElement.querySelector('a[href*="watch"]') ||
                                           songElement.querySelector('.song-title');
                        if (titleElement) {
                            songTitle = titleElement.textContent?.trim() || titleElement.title || 'Unknown Song';
                        }
                    }
                    
                    button.click();
                    likedCount++;
                    this.stats.totalLiked++;
                    
                    this.log(`Liked: "${songTitle}" (${this.stats.totalLiked} total)`, 'success');
                    
                    // Wait between clicks with random delay to avoid overwhelming the server
                    if (i < likeButtons.length - 1) {
                        const randomDelay = this.getRandomLikeDelay();
                        this.log(`Waiting ${(randomDelay/1000).toFixed(1)}s before next like...`, 'debug');
                        await this.delay(randomDelay);
                    }
                }
            } catch (error) {
                this.log(`Error liking song: ${error.message}`, 'error');
            }
        }
        
        return likedCount;
    }

    // Find the correct scrollable container for YouTube Music
    getScrollContainer() {
        // Try different possible scroll containers for YouTube Music
        const selectors = [
            '#contents',
            '.playlist-items',
            '.ytmusic-playlist-shelf-renderer',
            '[role="main"]',
            '.main-panel',
            '#main-panel'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.scrollHeight > element.clientHeight) {
                this.log(`Using scroll container: ${selector}`, 'debug');
                return element;
            }
        }
        
        // Fallback to window/document
        this.log('Using window as scroll container', 'debug');
        return null;
    }

    // Scroll down to load more content
    async scrollToLoadMore() {
        const scrollContainer = this.getScrollContainer();
        
        let initialHeight, scrollElement;
        if (scrollContainer) {
            initialHeight = scrollContainer.scrollHeight;
            scrollElement = scrollContainer;
        } else {
            initialHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            scrollElement = window;
        }
        
        this.log(`Scrolling to load more content... (attempt ${this.stats.scrollAttempts + 1})`, 'debug');
        
        // Get current scroll position
        const initialScrollPos = scrollContainer ? scrollContainer.scrollTop : window.pageYOffset;
        
        // Try multiple scroll methods for better compatibility
        if (scrollContainer) {
            // Scroll the container element
            scrollContainer.scrollTop += this.config.scrollDistance;
            // Also try scrollIntoView on the last visible element
            const lastElement = scrollContainer.querySelector('*:last-child');
            if (lastElement) {
                lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        } else {
            // Scroll the window
            window.scrollBy({ top: this.config.scrollDistance, behavior: 'smooth' });
            // Also try scrolling to bottom
            window.scrollTo({ 
                top: document.body.scrollHeight, 
                behavior: 'smooth' 
            });
        }
        
        // Wait for content to load
        await this.delay(this.config.loadWaitTime);
        
        // Check if we actually scrolled
        const currentScrollPos = scrollContainer ? scrollContainer.scrollTop : window.pageYOffset;
        const didScroll = currentScrollPos > initialScrollPos;
        
        // Check for new content
        let newHeight;
        if (scrollContainer) {
            newHeight = scrollContainer.scrollHeight;
        } else {
            newHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        }
        
        const hasNewContent = newHeight > initialHeight;
        const hasNewSongs = this.getLikeButtons().length > 0;
        
        this.stats.scrollAttempts++;
        
        if (hasNewContent) {
            this.log('New content loaded after scrolling', 'debug');
        } else if (didScroll) {
            this.log('Scrolled but no new content detected', 'debug');
        } else {
            this.log('Failed to scroll - may have reached end', 'debug');
        }
        
        // Return true if we found new content OR new songs appeared
        return hasNewContent || hasNewSongs;
    }

    // Check if we should continue processing
    shouldContinue() {
        if (this.shouldStop) {
            this.log('Script stopped by user', 'warning');
            return false;
        }
        
        if (this.stats.scrollAttempts >= this.config.maxScrollAttempts) {
            this.log(`Reached maximum scroll attempts (${this.config.maxScrollAttempts})`, 'warning');
            return false;
        }
        
        return true;
    }

    // Main execution loop
    async start() {
        if (this.isRunning) {
            this.log('Script is already running', 'warning');
            return;
        }
        
        this.isRunning = true;
        this.shouldStop = false;
        this.stats.startTime = Date.now();
        
        this.log('🚀 Starting YouTube Music Auto-Like script...');
        this.log('💡 You can stop the script anytime by running: autoLiker.stop()');
        
        // Make the instance globally available for manual control
        window.autoLiker = this;
        
        try {
            let consecutiveEmptyRounds = 0;
            let noScrollProgress = 0;
            
            while (this.shouldContinue()) {
                // Like all visible songs first
                const likedCount = await this.likeVisibleSongs();
                
                if (likedCount === 0) {
                    consecutiveEmptyRounds++;
                    this.log(`No songs found to like (attempt ${consecutiveEmptyRounds}/5)`, 'debug');
                    
                    // Try scrolling to load more content
                    const scrollResult = await this.scrollToLoadMore();
                    
                    if (!scrollResult) {
                        noScrollProgress++;
                        this.log(`No scroll progress (${noScrollProgress}/3)`, 'debug');
                        
                        if (noScrollProgress >= 3) {
                            this.log('Unable to scroll further - likely reached end of playlist');
                            break;
                        }
                    } else {
                        noScrollProgress = 0; // Reset scroll progress counter
                        this.log('Successfully scrolled and loaded more content', 'debug');
                    }
                    
                    if (consecutiveEmptyRounds >= 5 && noScrollProgress >= 2) {
                        this.log('No more songs to like found after multiple scroll attempts');
                        break;
                    }
                } else {
                    // Reset counters when we successfully like songs
                    consecutiveEmptyRounds = 0;
                    noScrollProgress = 0;
                    
                    this.log(`Successfully liked ${likedCount} songs, scrolling for more...`, 'debug');
                    
                    // Always try to scroll to load more songs after liking
                    await this.scrollToLoadMore();
                }
                
                // Wait before next cycle (shorter delay since we have better logic now)
                await this.delay(this.config.scrollDelay / 2);
            }
            
        } catch (error) {
            this.log(`Unexpected error: ${error.message}`, 'error');
        } finally {
            this.isRunning = false;
            this.showFinalStats();
        }
    }

    // Stop the script
    stop() {
        if (!this.isRunning) {
            this.log('Script is not currently running', 'warning');
            return;
        }
        
        this.shouldStop = true;
        this.log('Stopping script...', 'warning');
    }

    // Get current status and statistics
    getStatus() {
        const runtime = Math.round((Date.now() - this.stats.startTime) / 1000);
        return {
            isRunning: this.isRunning,
            totalLiked: this.stats.totalLiked,
            scrollAttempts: this.stats.scrollAttempts,
            runtimeSeconds: runtime,
            config: this.config
        };
    }

    // Show final statistics
    showFinalStats() {
        const runtime = Math.round((Date.now() - this.stats.startTime) / 1000);
        
        console.log('\n' + '='.repeat(50));
        this.log('🎉 Script completed!', 'success');
        this.log(`📊 Total songs liked: ${this.stats.totalLiked}`, 'success');
        this.log(`⏱️ Runtime: ${runtime} seconds`, 'info');
        this.log(`📜 Scroll attempts: ${this.stats.scrollAttempts}`, 'info');
        console.log('='.repeat(50) + '\n');
        
        if (this.stats.totalLiked > 0) {
            this.log('All done! Your playlist songs have been liked! ❤️', 'success');
        } else {
            this.log('No songs were liked. They might already be liked or the playlist might be empty.', 'info');
        }
    }

    // Generate random delay between configured min and max
    getRandomLikeDelay() {
        const min = this.config.likeDelayMin;
        const max = this.config.likeDelayMax;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize and start the auto-liker
console.log('🎵 YouTube Music Auto-Like Script Loaded');
console.log('📋 Creating auto-liker with default settings...');

const autoLiker = new YouTubeMusicAutoLike({
    likeDelayMin: 1200,   // Minimum 1.2 seconds between likes
    likeDelayMax: 2300,   // Maximum 2.3 seconds between likes
    scrollDelay: 4000,    // 4 seconds between scroll cycles (reduced for better performance)
    scrollDistance: 800,  // Scroll 800px at a time (more manageable chunks)
    loadWaitTime: 3000,   // Wait 3 seconds for content to load after scrolling
    maxScrollAttempts: 50, // Maximum 50 scroll attempts
    verbose: true         // Enable detailed logging
});

// Start the process
autoLiker.start();

// Usage instructions
console.log('\n💡 CONTROLS:');
console.log('• To stop the script: autoLiker.stop()');
console.log('• To check status: autoLiker.getStatus()');  
console.log('• To start again: autoLiker.start()');
console.log('• To test scrolling: autoLiker.scrollToLoadMore()');
console.log('• To like visible songs: autoLiker.likeVisibleSongs()'); 