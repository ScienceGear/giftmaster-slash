const inputs = document.querySelectorAll(".input");


function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}

function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}


inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});



// JavaScript for toggling the tooltip
const floatingHeart = document.querySelector('.floating-heart');

floatingHeart.addEventListener('click', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
});

// Hide the tooltip initially
document.addEventListener('DOMContentLoaded', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = 'none';
});
