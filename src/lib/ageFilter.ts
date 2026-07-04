export function setupAgeFilter(root: ParentNode = document) {
  const filterRoots = Array.from(root.querySelectorAll<HTMLElement>("[data-age-filter-root]"));

  for (const filterRoot of filterRoots) {
    if (filterRoot.dataset.ageFilterReady === "true") {
      continue;
    }

    const buttons = Array.from(filterRoot.querySelectorAll<HTMLButtonElement>("[data-age-filter]"));
    const cards = Array.from(filterRoot.ownerDocument.querySelectorAll<HTMLElement>("[data-lesson-card][data-age]"));
    let activeAge: string | null = null;

    const applyFilter = () => {
      for (const button of buttons) {
        const isActive = button.dataset.ageFilter === activeAge;
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
        button.classList.toggle("active", isActive);
      }

      for (const card of cards) {
        card.hidden = activeAge !== null && card.dataset.age !== activeAge;
      }
    };

    for (const button of buttons) {
      button.addEventListener("click", () => {
        const selectedAge = button.dataset.ageFilter ?? null;
        activeAge = activeAge === selectedAge ? null : selectedAge;
        applyFilter();
      });
    }

    filterRoot.dataset.ageFilterReady = "true";
    applyFilter();
  }
}
