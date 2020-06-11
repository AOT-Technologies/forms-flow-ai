export function expectTagsToContain(tags = []) {
  cy.getByTestId("TagsControl").within(() => {
    cy.getByTestId("TagLabel")
      .should("have.length", tags.length)
      .each($tag => expect(tags).to.contain($tag.text()));
  });
}

export function typeInTagsSelectAndSave(text) {
  cy.getByTestId("EditTagsDialog").within(() => {
    cy.get(".ant-select")
      .find("input")
      .type(text);

    cy.contains("OK").click();
  });
}
