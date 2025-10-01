document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("mode-toggle");
  const knob = toggle.querySelector(".toggle-knob i");
  const body = document.body;

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");

    if (body.classList.contains("dark-mode")) {
      body.classList.remove("dark-mode");
      body.classList.add("light-mode");
      knob.classList.replace("fa-solid fa-moon", " fa-solid fa-sun");
    } else {
      body.classList.remove("light-mode");
      body.classList.add("dark-mode");
      knob.classList.replace("fa-solid fa-sun", "fa-solid fa-moon");
    }
  });
});
