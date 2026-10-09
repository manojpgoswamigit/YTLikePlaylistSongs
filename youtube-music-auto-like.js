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

    // Get all like buttons that haven't been liked yet (excluding suggestions/recommendations)
    getLikeButtons() {
        // Prioritize playlist shelf to avoid liking songs from suggestions/shelves
        const selectors = [
            'ytmusic-playlist-shelf-renderer ytmusic-responsive-list-item-renderer button[aria-label="Like"]',
            'ytmusic-responsive-list-item-renderer button[aria-label="Like"]'
        ];
        
        let buttons = [];
        let usedSelector = '';
        
        for (const selector of selectors) {
            const foundButtons = document.querySelectorAll(selector);
            if (foundButtons.length > 0) {
                buttons = Array.from(foundButtons);
                usedSelector = selector;
                this.log(`Found ${buttons.length} potential like buttons using selector: ${selector}`, 'debug');
                break;
            }
        }
        
        if (buttons.length === 0) {
            this.log('No like buttons found with any selector. Checking page structure...', 'debug');
            
            // Debug: Check what buttons exist
            const allButtons = document.querySelectorAll('button');
            this.log(`Total buttons found: ${allButtons.length}`, 'debug');
            
            // Sample some button attributes
            Array.from(allButtons).slice(0, 5).forEach((btn, i) => {
                this.log(`Button ${i}: aria-label="${btn.getAttribute('aria-label')}", title="${btn.getAttribute('title')}"`, 'debug');
            });
        }
        
        // Filter out already liked buttons and strictly exclude suggestions/recommendations
        const unlikedButtons = buttons.filter(button => {
            // Exclude buttons from suggestions/recommendations shelves
            if (button.closest('ytmusic-shelf-renderer')) {
                return false;
            }

            // If a playlist shelf exists, strictly only include songs inside it
            const playlistShelf = document.querySelector('ytmusic-playlist-shelf-renderer');
            if (playlistShelf && !playlistShelf.contains(button)) {
                return false;
            }

            const isPressed = button.getAttribute('aria-pressed') === 'true';
            const isDisabled = button.disabled || button.getAttribute('disabled') !== null;
            const ariaLabel = button.getAttribute('aria-label') || '';
            const isAlreadyLiked = ariaLabel.includes('Remove from liked') || 
                                 ariaLabel.includes('Unlike') || 
                                 ariaLabel.includes('Dislike');
            
            return !isPressed && !isDisabled && !isAlreadyLiked;
        });
        
        if (buttons.length > 0 && unlikedButtons.length === 0) {
            this.log(`Found ${buttons.length} like buttons but all appear to be already liked or in suggestions`, 'debug');
        }
        
        return unlikedButtons;
    }

    // Extract song title from song item for logging
    // ponytail: DOM scraper targets YouTube Music's ytmusic-responsive-list-item-renderer and yt-formatted-string.title.
    getSongTitle(button) {
        try {
            // Find parent song container
            const songElement = button.closest('ytmusic-responsive-list-item-renderer');

            if (!songElement) {
                this.log('Could not find ytmusic-responsive-list-item-renderer container for like button', 'debug');
                return 'Unknown Song';
            }

            // Target exact song title element within the container
            const titleElement = songElement.querySelector('.title-column yt-formatted-string.title') ||
                                 songElement.querySelector('yt-formatted-string.title');

            if (titleElement) {
                const title = (titleElement.getAttribute('title') || titleElement.textContent || '')
                    .trim()
                    .replace(/\s+/g, ' ');
                if (title) {
                    return title;
                }
            }

            this.log('Found song container but could not extract title from yt-formatted-string.title', 'debug');
        } catch (error) {
            this.log(`Error extracting song title: ${error.message}`, 'debug');
        }

        return 'Unknown Song';
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
                    const songTitle = this.getSongTitle(button);
                    
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
        // Updated selectors based on current YouTube Music structure
        const selectors = [
            // Primary scrollable container in YouTube Music playlists
            'ytmusic-section-list-renderer.scroller',
            'ytmusic-section-list-renderer',
            // Contents within the playlist shelf
            'ytmusic-playlist-shelf-renderer #contents',
            // General contents containers
            'ytmusic-two-column-browse-results-renderer #contents',
            'ytmusic-browse-response #contents',
            '#contents.style-scope.ytmusic-section-list-renderer',
            '#contents',
            // Fallback selectors
            '.playlist-items',
            '.ytmusic-playlist-shelf-renderer',
            '[role="main"]',
            '.main-panel',
            '#main-panel',
            // App layout container
            'ytmusic-app-layout#layout'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                // Check if element is actually scrollable
                const isScrollable = element.scrollHeight > element.clientHeight || 
                                   element.scrollHeight > element.offsetHeight;
                
                if (isScrollable) {
                    this.log(`Using scroll container: ${selector} (scrollHeight: ${element.scrollHeight}, clientHeight: ${element.clientHeight})`, 'debug');
                    return element;
                }
                
                this.log(`Found element for ${selector} but not scrollable`, 'debug');
            }
        }
        
        // Fallback to window/document if no container found
        this.log('No scrollable container found, using window', 'debug');
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
        
        // Get initial number of songs for comparison
        const initialSongCount = this.getLikeButtons().length;
        
        // Try multiple scroll methods for better compatibility with YouTube Music
        if (scrollContainer) {
            // Method 1: Scroll the container element
            const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            const currentScrollTop = scrollContainer.scrollTop;
            const scrollAmount = Math.min(this.config.scrollDistance, maxScrollTop - currentScrollTop);
            
            if (scrollAmount > 0) {
                scrollContainer.scrollTop += scrollAmount;
                this.log(`Scrolled container by ${scrollAmount}px`, 'debug');
            }
            
            // Method 2: Try scrollIntoView on the last visible song item in playlist
            const playlistShelf = document.querySelector('ytmusic-playlist-shelf-renderer');
            const lastSongItem = playlistShelf ?
                playlistShelf.querySelector('ytmusic-responsive-list-item-renderer:last-of-type') :
                scrollContainer.querySelector('ytmusic-responsive-list-item-renderer:last-of-type');
            if (lastSongItem) {
                lastSongItem.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'end',
                    inline: 'nearest'
                });
                this.log('Scrolled last playlist song item into view', 'debug');
            }
            
            // Method 3: Force scroll to bottom if we're close
            if (currentScrollTop > maxScrollTop * 0.9) {
                scrollContainer.scrollTop = maxScrollTop;
                this.log('Forced scroll to bottom of container', 'debug');
            }
        } else {
            // Window scrolling methods
            const maxWindowScroll = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            ) - window.innerHeight;
            
            const currentWindowScroll = window.pageYOffset;
            const scrollAmount = Math.min(this.config.scrollDistance, maxWindowScroll - currentWindowScroll);
            
            if (scrollAmount > 0) {
                window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
                this.log(`Scrolled window by ${scrollAmount}px`, 'debug');
            }
            
            // Try scrolling to the last playlist song element
            const playlistShelf = document.querySelector('ytmusic-playlist-shelf-renderer');
            const lastSongItem = playlistShelf ?
                playlistShelf.querySelector('ytmusic-responsive-list-item-renderer:last-of-type') :
                document.querySelector('ytmusic-responsive-list-item-renderer:last-of-type');
            if (lastSongItem) {
                lastSongItem.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'end',
                    inline: 'nearest'
                });
                this.log('Scrolled last playlist song item into view (window)', 'debug');
            }
        }
        
        // Wait for content to load
        await this.delay(this.config.loadWaitTime);
        
        // Check if we actually scrolled (with a small delay to account for smooth scrolling)
        await this.delay(500); // Additional delay for smooth scroll animation
        const currentScrollPos = scrollContainer ? scrollContainer.scrollTop : window.pageYOffset;
        const didScroll = Math.abs(currentScrollPos - initialScrollPos) > 10; // Allow for small differences
        
        // Check for new content
        let newHeight;
        if (scrollContainer) {
            newHeight = scrollContainer.scrollHeight;
        } else {
            newHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        }
        
        const hasNewContent = newHeight > initialHeight;
        const newSongCount = this.getLikeButtons().length;
        const hasNewSongs = newSongCount > initialSongCount;
        
        this.stats.scrollAttempts++;
        
        this.log(`Scroll results: didScroll=${didScroll} (${initialScrollPos}px -> ${currentScrollPos}px), hasNewContent=${hasNewContent} (${initialHeight}px -> ${newHeight}px), hasNewSongs=${hasNewSongs} (${initialSongCount} -> ${newSongCount})`, 'debug');
        
        if (hasNewContent) {
            this.log('New content loaded after scrolling', 'debug');
        } else if (didScroll) {
            this.log('Scrolled but no new content detected', 'debug');
        } else {
            this.log('Failed to scroll - may have reached end', 'debug');
        }
        
        // Return true if we found new content OR new songs appeared OR we successfully scrolled
        return hasNewContent || hasNewSongs || didScroll;
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

    // Debug method to analyze current page structure
    debugPageStructure() {
        console.log('\n🔍 YouTube Music Page Structure Analysis:');
        console.log('==========================================');
        
        // Check for main containers
        const containers = [
            'ytmusic-app-layout#layout',
            'ytmusic-section-list-renderer.scroller',
            'ytmusic-section-list-renderer',
            'ytmusic-playlist-shelf-renderer',
            'ytmusic-two-column-browse-results-renderer',
            '#contents'
        ];
        
        containers.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`✓ Found: ${selector}`);
                console.log(`  - scrollHeight: ${element.scrollHeight}px`);
                console.log(`  - clientHeight: ${element.clientHeight}px`);
                console.log(`  - scrollTop: ${element.scrollTop}px`);
                console.log(`  - isScrollable: ${element.scrollHeight > element.clientHeight}`);
            } else {
                console.log(`✗ Not found: ${selector}`);
            }
        });
        
        // Check song items
        const songItems = document.querySelectorAll('ytmusic-responsive-list-item-renderer');
        console.log(`\n📄 Song items found: ${songItems.length}`);
        
        // Check like buttons
        const likeButtons = this.getLikeButtons();
        console.log(`❤️ Unliked songs: ${likeButtons.length}`);
        
        console.log('==========================================\n');
        
        return {
            containers: containers.map(selector => ({
                selector,
                found: !!document.querySelector(selector),
                element: document.querySelector(selector)
            })),
            songCount: songItems.length,
            likeButtonCount: likeButtons.length
        };
    }

    // Debug method to analyze like buttons specifically
    debugLikeButtons() {
        console.log('\n❤️ Like Button Analysis:');
        console.log('========================');
        
        // Check all possible button types
        const buttonTypes = [
            'button',
            'tp-yt-paper-icon-button', 
            'yt-icon-button',
            '[role="button"]'
        ];
        
        buttonTypes.forEach(type => {
            const buttons = document.querySelectorAll(type);
            console.log(`${type}: ${buttons.length} found`);
        });
        
        // Look for buttons with "like" in attributes
        const likeRelated = document.querySelectorAll('[aria-label*="Like"], [title*="Like"], [aria-label*="like"], [title*="like"]');
        console.log(`\nButtons with "like" in attributes: ${likeRelated.length}`);
        
        // Sample the first few like-related buttons
        Array.from(likeRelated).slice(0, 10).forEach((btn, i) => {
            console.log(`  ${i}: aria-label="${btn.getAttribute('aria-label')}", title="${btn.getAttribute('title')}", pressed="${btn.getAttribute('aria-pressed')}"`);
        });
        
        // Test current detection
        const detectedButtons = this.getLikeButtons();
        console.log(`\n✓ Currently detected unliked buttons: ${detectedButtons.length}`);
        
        // Show playlist song containers and sample extracted titles
        const playlistShelf = document.querySelector('ytmusic-playlist-shelf-renderer');
        const songContainers = playlistShelf ? 
            Array.from(playlistShelf.querySelectorAll('ytmusic-responsive-list-item-renderer')) :
            Array.from(document.querySelectorAll('ytmusic-responsive-list-item-renderer'))
                .filter(el => !el.closest('ytmusic-shelf-renderer'));
        console.log(`📄 Playlist song containers: ${songContainers.length}`);
        
        if (songContainers.length > 0) {
            console.log('\nSample song titles detected:');
            songContainers.slice(0, 5).forEach((container, i) => {
                const likeBtn = container.querySelector('button[aria-label="Like"], button');
                const title = likeBtn ? this.getSongTitle(likeBtn) : 'No button found';
                console.log(`  ${i + 1}: "${title}"`);
            });
        }
        
        console.log('========================\n');
        
        return {
            totalButtons: document.querySelectorAll('button').length,
            likeRelatedButtons: likeRelated.length,
            detectedLikeButtons: detectedButtons.length,
            songContainers: songContainers.length
        };
    }

    // Usage instructions
    help() {
        console.log('\n💡 CONTROLS:');
        console.log('• To stop the script: autoLiker.stop()');
        console.log('• To check status: autoLiker.getStatus()');  
        console.log('• To start again: autoLiker.start()');
        console.log('• To test scrolling: autoLiker.scrollToLoadMore()');
        console.log('• To like visible songs: autoLiker.likeVisibleSongs()');
        console.log('• To debug page structure: autoLiker.debugPageStructure()');
        console.log('• To debug like buttons: autoLiker.debugLikeButtons()'); 
        console.log('• To print these instructions again: autoLiker.help()');
    }
}

// Initialize and start the auto-liker
console.log('🎵 YouTube Music Auto-Like Script Loaded');
console.log('📋 Creating auto-liker with default settings...');

const autoLiker = new YouTubeMusicAutoLike({
    likeDelayMin: 1200,   // Minimum 1.2 seconds between likes
    likeDelayMax: 2300,   // Maximum 2.3 seconds between likes
    scrollDelay: 3000,    // 3 seconds between scroll cycles (reduced for better performance)
    scrollDistance: 600,  // Scroll 600px at a time (optimized for YouTube Music)
    loadWaitTime: 4000,   // Wait 4 seconds for content to load after scrolling (increased for YouTube Music)
    maxScrollAttempts: 75, // Maximum 75 scroll attempts (increased due to better detection)
    verbose: true         // Enable detailed logging
});

// Usage instructions
autoLiker.help();

// Start the process
autoLiker.start();
