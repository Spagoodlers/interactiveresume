// Simple Interactive Resume Script

// Global variables
let projects = [];
let prototypes = [];
let firstAppearance = true;


// Smooth transition variables
let currentBgColor = { r: 254, g: 249, b: 231 };
let targetBgColor = { r: 254, g: 249, b: 231 };
let scrollVelocity = 0;
let lastScrollY = 0;
let lastSectionIndex = -1;

// Scroll hijacking variables
let isScrollHijacked = false;
let isTransitioning = false;
let sections = [];
let transitionZones = [];
let currentSectionIndex = 0;
let scrollDirection = 0;
let lastScrollTime = 0;

// Helper function to get month name from number
function getMonthName(monthNum) {
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNum] || '';
}

// Lerp function for smooth color transitions
function lerp(start, end, t) {
  return start + (end - start) * t;
}

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Update background color with lerp
function updateBackgroundColor() {
  const t = 0.05; // Lerp factor for smoothness
  currentBgColor.r = lerp(currentBgColor.r, targetBgColor.r, t);
  currentBgColor.g = lerp(currentBgColor.g, targetBgColor.g, t);
  currentBgColor.b = lerp(currentBgColor.b, targetBgColor.b, t);
  
  document.body.style.background = `linear-gradient(135deg, rgb(${currentBgColor.r}, ${currentBgColor.g}, ${currentBgColor.b}), rgb(${currentBgColor.r - 10}, ${currentBgColor.g - 10}, ${currentBgColor.b - 10}), rgb(${currentBgColor.r - 20}, ${currentBgColor.g - 20}, ${currentBgColor.b - 20}))`;
  
  requestAnimationFrame(updateBackgroundColor);
}

// Initialize scroll hijacking
function initScrollHijacking() {
  sections = document.querySelectorAll('section, .project-section');
  transitionZones = document.querySelectorAll('.transition-zone');
  
  // Set up scroll event listener for hijacking
  window.addEventListener('wheel', handleWheelScroll, { passive: false });
  window.addEventListener('keydown', handleKeyScroll);
  
  // Touch events for mobile
  window.addEventListener('touchstart', handleTouchStart, { passive: false });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
}

// Handle wheel scroll events
function handleWheelScroll(e) {
  if (isTransitioning) {
    e.preventDefault();
    return;
  }
  
  const currentTime = Date.now();
  const deltaTime = currentTime - lastScrollTime;
  
  if (deltaTime < 50) return; // Throttle rapid scrolling
  
  lastScrollTime = currentTime;
  scrollDirection = e.deltaY > 0 ? 1 : -1;
  
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const scrollVelocity = Math.abs(e.deltaY);
  
  // Find current section based on scroll position
  let currentSectionIndex = -1;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    
    if (scrollPosition >= sectionTop - 150 && scrollPosition < sectionBottom - 150) {
      currentSectionIndex = i;
      break;
    }
  }
  
  // If we found a current section, check boundaries with stricter requirements
  if (currentSectionIndex !== -1) {
    const currentSection = sections[currentSectionIndex];
    const sectionTop = currentSection.offsetTop;
    const sectionBottom = sectionTop + currentSection.offsetHeight;
    const sectionHeight = currentSection.offsetHeight;
    
    // Require more momentum and deeper scroll to leave section
    const scrollThreshold = Math.min(300, sectionHeight * 0.4); // At least 300px or 40% of section height
    const momentumThreshold = 80; // Minimum scroll velocity
    
    // Check if we're trying to scroll past section boundaries
    if (scrollDirection > 0 && 
        scrollVelocity > momentumThreshold && 
        scrollPosition + windowHeight >= sectionBottom - scrollThreshold) {
      e.preventDefault();
      
      // Infinite scroll: if at last section, loop to first
      if (currentSectionIndex >= sections.length - 1) {
        triggerInfiniteTransition(currentSectionIndex, 0, 'down');
      } else {
        triggerTransition(currentSectionIndex, currentSectionIndex + 1, 'down');
      }
      return;
    } else if (scrollDirection < 0 && 
               scrollVelocity > momentumThreshold && 
               scrollPosition <= sectionTop + scrollThreshold) {
      e.preventDefault();
      
      // Infinite scroll: if at first section, loop to last
      if (currentSectionIndex <= 0) {
        triggerInfiniteTransition(currentSectionIndex, sections.length - 1, 'up');
      } else {
        triggerTransition(currentSectionIndex, currentSectionIndex - 1, 'up');
      }
      return;
    }
  }
}

// Handle keyboard scroll events
function handleKeyScroll(e) {
  if (isTransitioning) return;
  
  let direction = 0;
  switch(e.key) {
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      direction = 1;
      break;
    case 'ArrowUp':
    case 'PageUp':
      direction = -1;
      break;
    default:
      return;
  }
  
  e.preventDefault();
  scrollDirection = direction;
  
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  
  // Find current section based on scroll position
  let currentSectionIndex = -1;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    
    if (scrollPosition >= sectionTop - 100 && scrollPosition < sectionBottom - 100) {
      currentSectionIndex = i;
      break;
    }
  }
  
  // If we found a current section, check boundaries
  if (currentSectionIndex !== -1) {
    const currentSection = sections[currentSectionIndex];
    const sectionTop = currentSection.offsetTop;
    const sectionBottom = sectionTop + currentSection.offsetHeight;
    
    if (direction > 0 && scrollPosition + windowHeight >= sectionBottom - 100) {
      // Infinite scroll: if at last section, loop to first
      if (currentSectionIndex >= sections.length - 1) {
        triggerInfiniteTransition(currentSectionIndex, 0, 'down');
      } else {
        triggerTransition(currentSectionIndex, currentSectionIndex + 1, 'down');
      }
      return;
    } else if (direction < 0 && scrollPosition <= sectionTop + 100) {
      // Infinite scroll: if at first section, loop to last
      if (currentSectionIndex <= 0) {
        triggerInfiniteTransition(currentSectionIndex, sections.length - 1, 'up');
      } else {
        triggerTransition(currentSectionIndex, currentSectionIndex - 1, 'up');
      }
      return;
    }
  }
}

// Touch handling variables
let touchStartY = 0;
let touchEndY = 0;

function handleTouchStart(e) {
  touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  if (isTransitioning) {
    e.preventDefault();
    return;
  }
  
  touchEndY = e.touches[0].clientY;
  const deltaY = touchStartY - touchEndY;
  
  if (Math.abs(deltaY) > 50) { // Threshold for swipe
    scrollDirection = deltaY > 0 ? 1 : -1;
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Find current section based on scroll position
    let currentSectionIndex = -1;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop - 100 && scrollPosition < sectionBottom - 100) {
        currentSectionIndex = i;
        break;
      }
    }
    
    // If we found a current section, check boundaries
    if (currentSectionIndex !== -1) {
      const currentSection = sections[currentSectionIndex];
      const sectionTop = currentSection.offsetTop;
      const sectionBottom = sectionTop + currentSection.offsetHeight;
      
      if (scrollDirection > 0 && scrollPosition + windowHeight >= sectionBottom - 100) {
        e.preventDefault();
        // Infinite scroll: if at last section, loop to first
        if (currentSectionIndex >= sections.length - 1) {
          triggerInfiniteTransition(currentSectionIndex, 0, 'down');
        } else {
          triggerTransition(currentSectionIndex, currentSectionIndex + 1, 'down');
        }
        return;
      } else if (scrollDirection < 0 && scrollPosition <= sectionTop + 100) {
        e.preventDefault();
        // Infinite scroll: if at first section, loop to last
        if (currentSectionIndex <= 0) {
          triggerInfiniteTransition(currentSectionIndex, sections.length - 1, 'up');
        } else {
          triggerTransition(currentSectionIndex, currentSectionIndex - 1, 'up');
        }
        return;
      }
    }
  }
}

// Trigger transition between sections
function triggerTransition(fromIndex, toIndex, direction) {
  if (isTransitioning) return;
  
  isTransitioning = true;
  currentSectionIndex = toIndex;
  
  // Find target transition zone
  const fromSection = sections[fromIndex];
  const toSection = sections[toIndex];
  
  // Add transition classes to sections
  fromSection.classList.add('section-exiting');
  toSection.classList.add('section-entering');
  
  // Calculate target scroll position (snap to next section)
  const targetScroll = toSection.offsetTop;
  
  // Set target background color based on section
  updateTargetBackgroundColor(toIndex);
  
  // Smooth scroll to target section
  window.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  });
  
  // Handle transition animations
  setTimeout(() => {
    // Remove transition classes
    fromSection.classList.remove('section-exiting');
    toSection.classList.remove('section-entering', 'section-entering-active');
    
    // Add active class to new section
    toSection.classList.add('section-entering-active');
    
    setTimeout(() => {
      toSection.classList.remove('section-entering-active');
      isTransitioning = false;
      updateTimeline(); // Update timeline after transition
      
      // Force background color to complete transition
      forceBackgroundColorComplete();
    }, 300);
  }, 300);
}

// Trigger infinite transition for seamless looping
function triggerInfiniteTransition(fromIndex, toIndex, direction) {
  if (isTransitioning) return;
  
  isTransitioning = true;
  currentSectionIndex = toIndex;
  
  const fromSection = sections[fromIndex];
  const toSection = sections[toIndex];
  
  // Add special infinite transition classes
  fromSection.classList.add('section-exiting-infinite');
  toSection.classList.add('section-entering-infinite');
  
  // Set target background color based on section
  updateTargetBackgroundColor(toIndex);
  
  // For infinite scroll, we need special handling
  if (direction === 'down' && toIndex === 0) {
    // Scrolling from last to first - jump to top seamlessly
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  } else if (direction === 'up' && toIndex === sections.length - 1) {
    // Scrolling from first to last - jump to bottom seamlessly
    const targetScroll = toSection.offsetTop;
    setTimeout(() => {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }, 100);
  }
  
  // Handle transition animations
  setTimeout(() => {
    // Remove transition classes
    fromSection.classList.remove('section-exiting-infinite');
    toSection.classList.remove('section-entering-infinite', 'section-entering-active');
    
    // Add active class to new section
    toSection.classList.add('section-entering-active');
    
    setTimeout(() => {
      toSection.classList.remove('section-entering-active');
      isTransitioning = false;
      updateTimeline();
      forceBackgroundColorComplete();
    }, 300);
  }, 400);
}

// Update target background color based on section
function updateTargetBackgroundColor(sectionIndex) {
  const section = sections[sectionIndex];
  const sectionId = section.id || '';
  
  // Clear all background classes
  document.body.className = document.body.className.replace(/bg-\w+/g, '');
  
  // Apply section-specific background class
  if (sectionId === 'about') {
    document.body.classList.add('bg-about');
    targetBgColor = { r: 254, g: 249, b: 231 };
  } else if (sectionId === 'skills') {
    document.body.classList.add('bg-skills');
    targetBgColor = { r: 243, g: 231, b: 254 };
  } else if (sectionId === 'gallery') {
    document.body.classList.add('bg-gallery');
    targetBgColor = { r: 254, g: 231, b: 240 };
  } else if (sectionId === 'contact') {
    document.body.classList.add('bg-contact');
    targetBgColor = { r: 254, g: 249, b: 231 };
  } else {
    // Project sections - cycle through patterns per project
    const projectIndex = sectionIndex % 5;
    const patternIndex = projectIndex;
    document.body.classList.add(`bg-project-${patternIndex}`);
    
    const colors = [
      { r: 254, g: 249, b: 231 },  // Project 1
      { r: 254, g: 243, b: 231 },  // Project 2
      { r: 243, g: 231, b: 254 },  // Project 3
      { r: 231, g: 254, b: 243 },  // Project 4
      { r: 231, g: 254, b: 240 }   // Project 5
    ];
    targetBgColor = colors[projectIndex];
  }
}

// Force background color to complete transition
function forceBackgroundColorComplete() {
  // Set current color to target immediately for unified feel
  currentBgColor = { ...targetBgColor };
  document.body.style.background = `linear-gradient(135deg, rgb(${targetBgColor.r}, ${targetBgColor.g}, ${targetBgColor.b}), rgb(${targetBgColor.r - 10}, ${targetBgColor.g - 10}, ${targetBgColor.b - 10}), rgb(${targetBgColor.r - 20}, ${targetBgColor.g - 20}, ${targetBgColor.b - 20}))`;
}


// Load project data
async function loadProjectData() {
  try {
    const response = await fetch('projects.json');
    const data = await response.json();
    projects = data.projects || [];
    prototypes = data.prototypes || [];
  } catch (error) {
    console.error('Error loading project data:', error);
    projects = [];
    prototypes = [];
  }
}

// Render projects
function renderProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;
  
  const allProjects = [...projects, ...prototypes].sort((a, b) => {
    const yearA = new Date(a.dateRange).getFullYear();
    const yearB = new Date(b.dateRange).getFullYear();
    const monthA = a.month || 6; // Default to middle of year if no month
    const monthB = b.month || 6;
    
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return monthA - monthB;
  });
  
  container.innerHTML = allProjects.map(project => `
    <section class="project-section" data-id="${project.id}">
      <div class="project-content">
        <div class="project-header">
          <h3>${project.title}</h3>
          <div class="project-badges">
            ${project.prototype ? '<span class="prototype-badge">Prototype</span>' : ''}
            <span class="release-badge">${project.release}</span>
            ${project.engine ? `<span class="engine-badge">${project.engine}</span>` : ''}
          </div>
        </div>
        <p class="project-date">${getMonthName(project.month || 0)} ${project.dateRange}</p>
        <p class="project-description">${project.description}</p>
        
        <!-- Media Container -->
        <div class="project-media">
          ${generateMediaContent(project)}
        </div>
        
        ${project.skills && project.skills.length > 0 ? `
          <div class="project-skills">
            <h4>Skills Used</h4>
            <div class="skills-tags">
              ${project.skills.map(skill => `
                <span class="skill-tag">${skill}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <div class="project-links">
          ${project.itchUrl ? `<a href="${project.itchUrl}" class="project-link" target="_blank">Play on itch.io</a>` : ''}
          ${project.gitUrl ? `<a href="${project.gitUrl}" class="project-link git-link" target="_blank">GitHub</a>` : ''}
        </div>
      </div>
    </section>
  `).join('');
}

// Generate media content based on project data
function generateMediaContent(project) {
  let mediaHTML = '';
  let hasMedia = false;
  
  // Banner image
  if (project.banner) {
    const bannerPath = `/${project.mediaPath}${project.banner}`;
    mediaHTML += `
      <div class="banner-container">
        <img src="${bannerPath}" alt="${project.title}" class="project-banner">
      </div>
    `;
    hasMedia = true;
  }
  
  // Embedded game (Pico8, web builds, etc.)
  if (project.embedUrl) {
    mediaHTML += `
      <div class="media-section">
        <h4 class="media-title">Play Game</h4>
        <div class="game-embed-container">
          <iframe src="${project.embedUrl}" class="game-iframe" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    `;
    hasMedia = true;
  }
  
  // Trailer
  if (project.trailer) {
    mediaHTML += `
      <div class="media-section">
        <h4 class="media-title">Trailer</h4>
        <div class="video-container">
          <iframe src="${project.trailer}" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    `;
    hasMedia = true;
  }
  
  // Art Gallery
  if (project.art && project.art.length > 0) {
    mediaHTML += `
      <div class="media-section">
        <h4 class="media-title">Gallery</h4>
        <div class="art-gallery">
          <div class="art-grid">
            ${project.art.map(img => `
              <div class="art-item" onclick="openLightbox('${project.mediaPath}${img}')">
                <img src="${project.mediaPath}${img}" alt="${project.title} art" class="art-image">
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    hasMedia = true;
  }
  
  return hasMedia ? mediaHTML : '<div class="no-media">No media available</div>';
}

// Initialize media components
function initMediaComponents() {
  // Lightbox functionality is handled by openLightbox function
  // No tab switching needed with vertical scroll layout
}

// Lightbox functionality
function openLightbox(imageSrc) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <img src="${imageSrc}" alt="Gallery image">
      <button class="lightbox-close">&times;</button>
    </div>
  `;
  
  document.body.appendChild(lightbox);
  
  // Close on background click or close button
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      document.body.removeChild(lightbox);
    }
  });
  
  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(lightbox);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Render timeline
function renderTimeline() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  
  const allProjects = [...projects, ...prototypes].sort((a, b) => {
    const yearA = new Date(a.dateRange).getFullYear();
    const yearB = new Date(b.dateRange).getFullYear();
    const monthA = a.month || 6;
    const monthB = b.month || 6;
    
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return monthA - monthB;
  });
  
  // Group by year
  const projectsByYear = {};
  allProjects.forEach(project => {
    const dateRange = project.dateRange;
    // Since dateRange is just a year string, parse it directly
    const year = parseInt(dateRange);
    
    // Debug: Log each project's date parsing
    console.log(`Project: ${project.title}, dateRange: ${dateRange}, parsed year: ${year}`);
    
    if (!projectsByYear[year]) {
      projectsByYear[year] = [];
    }
    projectsByYear[year].push(project);
  });
  
  // Get all years and sort them
  const allYears = Object.keys(projectsByYear).sort((a, b) => parseInt(a) - parseInt(b));
  
  // Debug: Log the years to see what's happening
  console.log('All years found:', allYears);
  console.log('Projects by year:', projectsByYear);
  
  // Find the earliest year to place Sections card before it
  const earliestYear = Math.min(...allYears.map(year => parseInt(year)));
  
  // Render timeline with section cards placed before the earliest year
  let timelineHTML = '';
  
  // Add Sections card at the very beginning
  timelineHTML += `
    <!-- Section Cards -->
    <div class="timeline-year">
      <span class="year-label">Sections</span>
      <div class="year-projects">
        <div class="timeline-item section-about" data-section="about">
          <div class="timeline-content">
            <h4>About</h4>
            <p class="timeline-date">Intro</p>
          </div>
        </div>
        <div class="timeline-item section-skills" data-section="skills">
          <div class="timeline-content">
            <h4>Skills</h4>
            <p class="timeline-date">Expertise</p>
          </div>
        </div>
        <div class="timeline-item section-gallery" data-section="gallery">
          <div class="timeline-content">
            <h4>Gallery</h4>
            <p class="timeline-date">Artwork</p>
          </div>
        </div>
        <div class="timeline-item section-contact" data-section="contact">
          <div class="timeline-content">
            <h4>Contact</h4>
            <p class="timeline-date">Reach Out</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add year cards and their projects in correct order
  allYears.forEach(year => {
    timelineHTML += `
      <!-- Year ${year} -->
      <div class="timeline-year">
        <span class="year-label">${year}</span>
        <div class="year-projects">
          ${(projectsByYear[year] || []).map(project => `
            <div class="timeline-item ${project.prototype ? 'prototype' : ''}" 
                 data-project-id="${project.id}">
              <div class="timeline-content">
                <h4>${project.nickname || project.title}</h4>
                <p class="timeline-date">${project.month ? getMonthName(project.month) : ''}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  timeline.innerHTML = timelineHTML;
  
  // Add click handlers for section cards
  document.querySelectorAll('.timeline-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.dataset.section;
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        // Update timeline after scroll completes
        setTimeout(() => {
          updateTimeline();
        }, 800);
      }
    });
  });
  
  // Add click handlers for project cards
  document.querySelectorAll('.timeline-item[data-project-id]').forEach(item => {
    item.addEventListener('click', () => {
      const projectId = item.dataset.projectId;
      const projectSection = document.querySelector(`.project-section[data-id="${projectId}"]`);
      if (projectSection) {
        projectSection.scrollIntoView({ behavior: 'smooth' });
        // Update timeline after scroll completes
        setTimeout(() => {
          updateTimeline();
        }, 800);
      }
    });
  });
}

// Update timeline card colors based on current section
function updateTimelineCardColors(sectionType, targetColor) {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  timelineItems.forEach(item => {
    // Reset all classes first
    item.classList.remove('section-about', 'section-skills', 'section-contact');
    
    // Apply dynamic color based on target background
    const rgbColor = `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})`;
    const lighterColor = `rgb(${Math.min(255, targetColor.r + 20)}, ${Math.min(255, targetColor.g + 20)}, ${Math.min(255, targetColor.b + 20)})`;
    
    if (!item.dataset.section && !item.dataset.projectId) {
      // Skip if it's not a card
      return;
    }
    
    // Apply gradient based on target color
    item.style.background = `linear-gradient(135deg, ${lighterColor}, ${rgbColor})`;
    item.style.borderColor = rgbColor;
    item.style.boxShadow = `0 3px 0 ${rgbColor}, 0 4px 8px rgba(${targetColor.r}, ${targetColor.g}, ${targetColor.b}, 0.3)`;
  });
}

// Update timeline based on scroll with smooth centering
function updateTimeline() {
  const projectSections = document.querySelectorAll('.project-section');
  const allSections = document.querySelectorAll('section, .project-section');
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timeline = document.getElementById('timeline');

  if (timelineItems.length === 0) return;

  // Find current section (including main sections)
  let currentSection = null;
  let currentSectionType = null;
  let currentIndex = -1;

  allSections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Check if we're in this section
    if (rect.top <= windowHeight * 0.75 && rect.bottom >= windowHeight * 0.25) {
      currentSection = section;
      currentIndex = index;
      currentSectionType = section.id || 'project';
    }
  });

  // Update active-section classes for spatial focus
  allSections.forEach((section, index) => {
    if (section.classList.contains('project-section')) {
      if (section === currentSection) {
        section.classList.add('active-section');
      } else {
        section.classList.remove('active-section');
      }
    }
  });

  // Update background with lerp based on current section
  if (currentSection) {
    let targetColor;
    
    if (currentSectionType === 'about') {
      targetColor = { r: 254, g: 249, b: 231 };  // Warm cream
    } else if (currentSectionType === 'skills') {
      targetColor = { r: 243, g: 231, b: 254 };  // Soft purple
    } else if (currentSectionType === 'gallery') {
      targetColor = { r: 254, g: 231, b: 240 };  // Soft pink
    } else if (currentSectionType === 'contact') {
      targetColor = { r: 231, g: 254, b: 243 };  // Soft green
    } else {
      // Project sections - cycle through colors
      const projectIndex = currentIndex % 5 + 1;
      const colors = [
        { r: 254, g: 249, b: 231 },  // Project 1 - cream
        { r: 254, g: 243, b: 231 },  // Project 2 - peach
        { r: 243, g: 231, b: 254 },  // Project 3 - purple
        { r: 231, g: 254, b: 243 },  // Project 4 - green
        { r: 231, g: 254, b: 240 }   // Project 5 - mint
      ];
      targetColor = colors[projectIndex - 1];
    }
    
    targetBgColor = targetColor;
    
    // Update timeline card colors based on current section
    updateTimelineCardColors(currentSectionType, targetColor);
    
    // Add section transition rush effect when changing sections
    if (lastSectionIndex !== -1 && lastSectionIndex !== currentIndex) {
      const projectSections = document.querySelectorAll('.project-section');
      projectSections.forEach(section => {
        section.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        section.style.transform = 'scale(1.02)';
        section.style.opacity = '0.95';
        setTimeout(() => {
          section.style.transform = '';
          section.style.opacity = '';
        }, 300);
      });
    }
    lastSectionIndex = currentIndex;
    
    
    // Update timeline visibility with smooth transitions
    if (firstAppearance) {
      timeline.classList.add('first-appearance');
      firstAppearance = false;
      setTimeout(() => {
        timeline.classList.remove('first-appearance');
        timeline.classList.add('visible');
        
        // Show year cards first with staggered fly-in effect
        const yearCards = document.querySelectorAll('.timeline-year');
        yearCards.forEach((yearCard, index) => {
          setTimeout(() => {
            yearCard.classList.add('year-visible');
          }, index * 200);
        });
        
        // Then show project cards with staggered fly-in effect
        setTimeout(() => {
          timelineItems.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('card-visible');
            }, index * 150);
          });
          
          // Center the first active item after all animations
          setTimeout(() => {
            const projectId = currentSection.dataset.id;
            const activeItem = document.querySelector(`.timeline-item[data-project-id="${projectId}"]`);
            if (activeItem) {
              centerTimelineItem(activeItem);
            }
          }, timelineItems.length * 150 + 300);
        }, yearCards.length * 200 + 200);
      }, 800);
    } else {
      timeline.classList.add('visible');
      // Ensure year cards are visible on subsequent appearances
      const yearCards = document.querySelectorAll('.timeline-year');
      yearCards.forEach(yearCard => {
        yearCard.classList.add('year-visible');
      });
      timelineItems.forEach(item => {
        item.classList.add('card-visible');
      });
    }
  } else {
    // Reset to about section color
    targetBgColor = { r: 254, g: 249, b: 231 };
    
    
    // Hide timeline when not in project sections
    timeline.classList.remove('visible');
    timelineItems.forEach(item => {
      item.classList.remove('card-visible');
    });
    const yearCards = document.querySelectorAll('.timeline-year');
    yearCards.forEach(yearCard => {
      yearCard.classList.remove('year-visible');
    });
    return;
  }
  
  // Update active states
  timelineItems.forEach((item, index) => {
    item.classList.remove('active', 'past');
    if (index < currentIndex) {
      item.classList.add('past');
    }
  });
  
  if (currentSection) {
    let activeItem = null;
    
    if (currentSectionType === 'about' || currentSectionType === 'skills' || currentSectionType === 'gallery' || currentSectionType === 'contact') {
      // Handle section cards
      activeItem = document.querySelector(`.timeline-item[data-section="${currentSectionType}"]`);
    } else {
      // Handle project cards
      const projectId = currentSection.dataset.id;
      activeItem = document.querySelector(`.timeline-item[data-project-id="${projectId}"]`);
    }
    
    if (activeItem) {
      activeItem.classList.add('active');
      
      // Center active item with improved algorithm
      centerTimelineItem(activeItem);
    }
  }
}

// Improved centering function with unified smooth experience
function centerTimelineItem(item) {
  const timelineEl = document.querySelector('.timeline');
  if (!timelineEl || !item) return;
  
  // Wait for fly-in animations to complete
  setTimeout(() => {
    const itemRect = item.getBoundingClientRect();
    const timelineRect = timelineEl.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    
    // Calculate exact center position for the item
    const targetCenterX = screenWidth / 2;
    const currentItemCenterX = itemRect.left + (itemRect.width / 2);
    
    // Calculate the scroll offset needed
    const scrollOffset = currentItemCenterX - targetCenterX;
    
    // Get current scroll position
    const currentScrollLeft = timelineEl.scrollLeft;
    
    // Calculate new scroll position
    let newScrollLeft = currentScrollLeft + scrollOffset;
    
    // Ensure we don't scroll beyond bounds
    const maxScroll = timelineEl.scrollWidth - timelineRect.width;
    newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll));
    
    // Apply ultra-smooth scroll for unified experience
    timelineEl.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  }, 50);
}


// Scroll handler with improved debouncing
let scrollTimeout;
let isScrolling = false;

window.addEventListener('scroll', () => {
  if (!isScrolling) {
    isScrolling = true;
    updateTimeline();
  }
  
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 100);
});

// Add resize handler for responsive behavior
window.addEventListener('resize', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    updateTimeline();
  }, 150);
});




// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadProjectData();
  renderProjects();
  renderTimeline();

  // Initialize scroll hijacking
  initScrollHijacking();
  
  // Initialize media components
  initMediaComponents();
  
  // Start background color lerp animation
  updateBackgroundColor();

  // Initial update
  updateTimeline();
  
  // Ensure page starts at top on refresh
  window.scrollTo(0, 0);
});
