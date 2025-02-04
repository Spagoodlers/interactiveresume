document.addEventListener("DOMContentLoaded", () => {
	// Intersection Observer for section transitions
	const sections = document.querySelectorAll("section");
	const observer = new IntersectionObserver(entries => {
	  entries.forEach(entry => {
	    if (entry.isIntersecting) {
		 entry.target.classList.remove("hidden");
	    } else {
		 entry.target.classList.add("hidden");
	    }
	  });
	}, { threshold: 0.2 });
   
	sections.forEach(section => {
	  observer.observe(section);
	  section.classList.add("hidden");
	});
   
	// Animate ellipsis after the handle on page load.
	const ellipsisElement = document.getElementById("ellipsis");
	let dotCount = 0;
	const maxDots = 3;
	const ellipsisInterval = setInterval(() => {
	  dotCount++;
	  ellipsisElement.textContent = '.'.repeat(dotCount);
	  if (dotCount === maxDots) {
	    clearInterval(ellipsisInterval);
	    // Remove the blinking caret by removing the 'caret' class
	    ellipsisElement.classList.remove("caret");
	  }
	}, 500); // 500ms per dot
   
	// Set each role's base color from its data attribute and add text rollover effect
	const roles = document.querySelectorAll(".role");
	roles.forEach(role => {
	  // Set the initial color from data attribute
	  role.style.color = role.dataset.color;
   
	  // Animation function for text rollover effect (lowercase, slower)
	  function animateText(element, targetText) {
	    if (element.animationInterval) {
		 clearInterval(element.animationInterval);
	    }
	    let frame = 0;
	    const totalFrames = targetText.length + 5;
	    element.animationInterval = setInterval(() => {
		 let result = "";
		 for (let i = 0; i < targetText.length; i++) {
		   if (i < frame) {
			result += targetText[i];
		   } else {
			// Generate a random lowercase letter (a-z)
			result += String.fromCharCode(97 + Math.floor(Math.random() * 26));
		   }
		 }
		 element.textContent = result;
		 frame++;
		 if (frame > targetText.length) {
		   clearInterval(element.animationInterval);
		   element.textContent = targetText;
		 }
	    }, 100); // 100ms per frame for a slower roll effect
	  }
   
	  // Mouseenter: animate to "generalist" and lerp color to #ffbb00
	  role.addEventListener("mouseenter", () => {
	    role.style.color = "#ffbb00"; // CSS transition smoothly animates the color
	    animateText(role, "generalist");
	  });
   
	  // Mouseleave: animate back to the original text and revert color
	  role.addEventListener("mouseleave", () => {
	    role.style.color = role.dataset.color; // Revert to the unique base color
	    animateText(role, role.dataset.original);
	  });
	});
   });
   