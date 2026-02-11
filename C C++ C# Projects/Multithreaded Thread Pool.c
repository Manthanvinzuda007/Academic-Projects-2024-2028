#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>

typedef struct Task {
    void (*function)(void* arg);
    void* arg;
    struct Task* next;
} Task;

typedef struct {
    pthread_mutex_t lock;
    pthread_cond_t notify;
    pthread_t* threads;
    Task* head;
    Task* tail;
    int thread_count;
    int shutdown;
} ThreadPool;

void* worker(void* pool_ptr) {
    ThreadPool* pool = (ThreadPool*)pool_ptr;
    while (1) {
        pthread_mutex_lock(&(pool->lock));
        while (pool->head == NULL && !pool->shutdown) {
            pthread_cond_wait(&(pool->notify), &(pool->lock));
        }
        if (pool->shutdown && pool->head == NULL) {
            pthread_mutex_unlock(&(pool->lock));
            pthread_exit(NULL);
        }
        Task* task = pool->head;
        pool->head = task->next;
        if (pool->head == NULL) pool->tail = NULL;
        pthread_mutex_unlock(&(pool->lock));
        (task->function)(task->arg);
        free(task);
    }
    return NULL;
}

ThreadPool* pool_create(int count) {
    ThreadPool* pool = (ThreadPool*)malloc(sizeof(ThreadPool));
    pool->thread_count = count;
    pool->shutdown = 0;
    pool->head = pool->tail = NULL;
    pthread_mutex_init(&(pool->lock), NULL);
    pthread_cond_init(&(pool->notify), NULL);
    pool->threads = (pthread_t*)malloc(sizeof(pthread_t) * count);
    for (int i = 0; i < count; i++) {
        pthread_create(&(pool->threads[i]), NULL, worker, (void*)pool);
    }
    return pool;
}

void pool_add_task(ThreadPool* pool, void (*func)(void*), void* arg) {
    Task* task = (Task*)malloc(sizeof(Task));
    task->function = func;
    task->arg = arg;
    task->next = NULL;
    pthread_mutex_lock(&(pool->lock));
    if (pool->tail) {
        pool->tail->next = task;
        pool->tail = task;
    } else {
        pool->head = pool->tail = task;
    }
    pthread_cond_signal(&(pool->notify));
    pthread_mutex_unlock(&(pool->lock));
}

void pool_destroy(ThreadPool* pool) {
    pthread_mutex_lock(&(pool->lock));
    pool->shutdown = 1;
    pthread_cond_broadcast(&(pool->notify));
    pthread_mutex_unlock(&(pool->lock));
    for (int i = 0; i < pool->thread_count; i++) {
        pthread_join(pool->threads[i], NULL);
    }
    free(pool->threads);
    pthread_mutex_destroy(&(pool->lock));
    pthread_cond_destroy(&(pool->notify));
    free(pool);
}

void example_work(void* arg) {
    int id = *(int*)arg;
    printf("Thread processing task %d\n", id);
    free(arg);
    usleep(100000);
}

int main() {
    ThreadPool* pool = pool_create(4);
    for (int i = 0; i < 20; i++) {
        int* arg = malloc(sizeof(*arg));
        *arg = i;
        pool_add_task(pool, example_work, arg);
    }
    usleep(2000000);
    pool_destroy(pool);
    return 0;
}
