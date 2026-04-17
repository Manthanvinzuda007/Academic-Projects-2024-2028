#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Structure to hold our library items
struct Manga {
    int id;
    char title[100];
    char author[100];
    int volumes;
};

// Function prototypes
void addManga();
void viewManga();
void searchManga();

int main() {
    int choice;
    while (1) {
        printf("\n==================================\n");
        printf("    MANGA & BOOK LIBRARY MANAGER  \n");
        printf("==================================\n");
        printf("1. Add New Title\n");
        printf("2. View Collection\n");
        printf("3. Search by ID\n");
        printf("4. Exit\n");
        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch (choice) {
            case 1: addManga(); break;
            case 2: viewManga(); break;
            case 3: searchManga(); break;
            case 4: 
                printf("Exiting Library... Have a great day!\n");
                exit(0);
            default: 
                printf("Invalid choice! Please try again.\n");
        }
    }
    return 0;
}

void addManga() {
    // Open file in append-binary mode
    FILE *file = fopen("library.dat", "ab");
    if (file == NULL) {
        printf("Error opening file!\n");
        return;
    }

    struct Manga m;
    printf("\nEnter ID number: ");
    scanf("%d", &m.id);
    getchar(); // Clear the newline character left in the buffer by scanf

    printf("Enter Title: ");
    fgets(m.title, sizeof(m.title), stdin);
    m.title[strcspn(m.title, "\n")] = 0; // Remove the trailing newline

    printf("Enter Author/Mangaka: ");
    fgets(m.author, sizeof(m.author), stdin);
    m.author[strcspn(m.author, "\n")] = 0;

    printf("Enter Number of Volumes: ");
    scanf("%d", &m.volumes);

    // Write the struct directly to the file
    fwrite(&m, sizeof(struct Manga), 1, file);
    fclose(file);
    printf("Title added to your collection successfully!\n");
}

void viewManga() {
    // Open file in read-binary mode
    FILE *file = fopen("library.dat", "rb");
    if (file == NULL) {
        printf("\nNo records found! Please add a title first.\n");
        return;
    }

    struct Manga m;
    printf("\n--------------------------------------------------------\n");
    printf("%-5s | %-25s | %-15s | %-5s\n", "ID", "TITLE", "AUTHOR", "VOLS");
    printf("--------------------------------------------------------\n");

    // Read and print until the end of the file
    while (fread(&m, sizeof(struct Manga), 1, file)) {
        printf("%-5d | %-25s | %-15s | %-5d\n", m.id, m.title, m.author, m.volumes);
    }
    printf("--------------------------------------------------------\n");
    fclose(file);
}

void searchManga() {
    FILE *file = fopen("library.dat", "rb");
    if (file == NULL) {
        printf("\nNo records found!\n");
        return;
    }

    int searchId, found = 0;
    struct Manga m;
    printf("\nEnter ID to search: ");
    scanf("%d", &searchId);

    while (fread(&m, sizeof(struct Manga), 1, file)) {
        if (m.id == searchId) {
            printf("\n--- Record Found ---\n");
            printf("Title: %s\n", m.title);
            printf("Author: %s\n", m.author);
            printf("Volumes: %d\n", m.volumes);
            found = 1;
            break;
        }
    }

    if (!found) {
        printf("\nTitle with ID %d not found in the library.\n", searchId);
    }
    fclose(file);
}
