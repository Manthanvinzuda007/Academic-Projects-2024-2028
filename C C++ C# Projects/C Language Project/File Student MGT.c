#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 1.Student's Info (Structure)
typedef struct {
    int id;
    char name[50];
    float marks;
} Student;

// 2. Function That Displayed Data 
void displayStudents(Student *list, int count) {
    printf("\n--- Students Details ---\n");
    printf("ID\tName\t\tMarks\n");
    printf("-------------------------------\n");
    for (int i = 0; i < count; i++) {
        printf("%d\t%s\t\t%.2f\n", list[i].id, list[i].name, list[i].marks);
    }
}

int main() {
    int n;
    Student *students;

    printf("How Many Students Data Do You Enter ? ");
    scanf("%d", &n);

    // 3. Dynamic memory allocation(Malloc)
    students = (Student *)malloc(n * sizeof(Student));

    if (students == NULL) {
        printf("Memory Is Full !\n");
        return 1;
    }

    // 4. Data Input 
    for (int i = 0; i < n; i++) {
        printf("\nStudent %d Informations :\n", i + 1);
        printf("ID: ");
        scanf("%d", &students[i].id);
        
        printf("Name: ");
        scanf("%s", students[i].name); // Name Write Without Space
        
        printf("Marks: ");
        scanf("%f", &students[i].marks);
    }

    // 5. Show Report 
    displayStudents(students, n);

    // 6. Memory Free
    free(students);
    printf("\nMemory Was Clean Now , Program Is Ended .\n");

    return 0;
}
